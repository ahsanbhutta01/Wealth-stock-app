import { getNews } from "../actions/finhub.action";
import { getAllUsersForNewsEmail } from "../actions/user.action";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.action";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { formatDateToday, getFormattedTodayDate } from "../utils";
import { inngest } from "./client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompt";


export const sendSignUpEmail = inngest.createFunction(
  { id: 'sign-up-email' },
  { event: 'app/user.created' },
  async ({ event, step }) => {
    const userProfile = `
      -Country: ${event.data.country}
      -Investment goals: ${event.data.investmentGoals}
      -Risk tolerance: ${event.data.riskTolerance}
      -Preferred industry: ${event.data.preferredIndustry}
    `

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(`{{userProfile}}`, userProfile);
    const response = await step.ai.infer('generate-welcome-intro', {
      model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
      body: {
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      }
    })

    await step.run('send-welcome-email', async () => {
      const part = response.candidates?.[0].content?.parts?.[0];
      const introText = (part && 'text' in part ? part.text : null) || "Thanks for joining B.Wealth.You now have the tools to track markets and make smarter"

      const { data: { email, name } } = event;

      return await sendWelcomeEmail({ email, name, intro: introText })
    })

    return {
      success: true,
      message: "Welcome email send successfully"
    }
  }

)

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 1 */2 *" }],

  async ({ step }) => {

    // -------------------------
    // STEP 1: Get all users
    // -------------------------
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);
    if (!users || users.length === 0)
      return { success: false, message: "No users found for news email" };


    // -------------------------
    // STEP 2: Prepare articles for each user
    // -------------------------
    const newsPerUser = await step.run("prepare-news", async () => {
      const out: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];

      for (const user of users) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          articles = (articles || []).slice(0, 6);

          if (!articles.length) {
            articles = (await getNews())?.slice(0, 6) || [];
          }

          out.push({ user, articles });
        } catch (err) {
          console.log("Error preparing news:", user.email, err);
          out.push({ user, articles: [] });
        }
      }

      return out;
    });

    // -------------------------
    // STEP 3: Summaries
    // -------------------------
    const summaries: { user: UserForNewsEmail; newsContent: string | null }[] = [];

    for (const { user, articles } of newsPerUser) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2)
        );

        // AI CALL MUST BE OUTSIDE step.run
        const result = await step.ai.infer(`summary-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = result.candidates?.[0]?.content?.parts?.[0];
        const text = part && "text" in part ? part.text : "No market news.";

        summaries.push({ user, newsContent: text });
      } catch (err) {
        console.log("AI summarization failed:", user.email);
        summaries.push({ user, newsContent: null });
      }
    }

    // -------------------------
    // STEP 4: Send emails
    // -------------------------
    await step.run("send-news-emails", async () => {
      await Promise.all(
        summaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return;

          return sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        })
      );
    });

    return { success: true, message: "Daily news summary email sent successfully!" };
  }
);
