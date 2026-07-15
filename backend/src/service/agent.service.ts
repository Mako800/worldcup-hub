import { Inject, Provide } from "@midwayjs/core";
import { TeamService } from "./team.service";
import { MatchService } from "./match.service";
import { StandingsService } from "./standings.service";
import { AgentResponse } from "../interface";

type IntentHandler = (message: string, userName: string) => AgentResponse;

@Provide()
export class AgentService {
  @Inject()
  teamService: TeamService;

  @Inject()
  matchService: MatchService;

  @Inject()
  standingsService: StandingsService;

  private intents: {
    keywords: string[];
    intent: string;
    handler: IntentHandler;
  }[] = [];

  constructor() {
    this.intents = [
      {
        keywords: [
          "排名",
          "积分榜",
          "排行榜",
          "谁第一",
          "谁领先",
          "standings",
          "league table",
          "积分",
          "第几名",
        ],
        intent: "standings",
        handler: this.handleStandings.bind(this),
      },
      {
        keywords: [
          "阿根廷",
          "巴西",
          "法国",
          "德国",
          "英格兰",
          "西班牙",
          "葡萄牙",
          "荷兰",
          "意大利",
          "比利时",
          "克罗地亚",
          "乌拉圭",
          "日本",
          "韩国",
          "伊朗",
          "沙特",
          "塞内加尔",
          "摩洛哥",
          "尼日利亚",
          "加纳",
          "墨西哥",
          "美国",
          "加拿大",
          "哥伦比亚",
          "厄瓜多尔",
          "澳大利亚",
          "丹麦",
          "瑞士",
          "塞尔维亚",
          "波兰",
          "埃及",
          "突尼斯",
          "argentina",
          "brazil",
          "france",
          "germany",
          "england",
          "spain",
          "portugal",
          "netherlands",
          "italy",
          "belgium",
          "croatia",
          "uruguay",
          "japan",
          "korea",
          "iran",
          "saudi",
          "senegal",
          "morocco",
          "nigeria",
          "ghana",
          "mexico",
          "usa",
          "canada",
          "colombia",
          "ecuador",
          "australia",
          "denmark",
          "switzerland",
          "serbia",
          "poland",
          "egypt",
          "tunisia",
        ],
        intent: "team_info",
        handler: this.handleTeamInfo.bind(this),
      },
      {
        keywords: [
          "下一场",
          "接下来",
          "赛程",
          "即将",
          "周末",
          "upcoming",
          "next match",
          "什么时候",
          "比赛时间",
        ],
        intent: "upcoming_matches",
        handler: this.handleUpcoming.bind(this),
      },
      {
        keywords: [
          "结果",
          "比分",
          "谁赢了",
          "上一场",
          "result",
          "score",
          "finished",
          "赢了",
        ],
        intent: "match_result",
        handler: this.handleResults.bind(this),
      },
      {
        keywords: ["预测", "谁会赢", "猜", "predict", "who will win", "怎么看"],
        intent: "prediction_help",
        handler: this.handlePredictionHelp.bind(this),
      },
      {
        keywords: [
          "你好",
          "嗨",
          "hi",
          "hello",
          "hey",
          "谢谢",
          "thanks",
          "帮助",
          "help",
          "能做什么",
          "功能",
        ],
        intent: "greeting",
        handler: this.handleGreeting.bind(this),
      },
    ];
  }

  processMessage(message: string, userName: string): AgentResponse {
    const lower = message.toLowerCase();

    for (const intent of this.intents) {
      if (intent.keywords.some((kw) => lower.includes(kw))) {
        return intent.handler(message, userName);
      }
    }

    return this.handleUnknown();
  }

  listSuggestions(): string[] {
    return [
      "目前的积分榜排名是怎样的？",
      "阿根廷最近表现如何？",
      "接下来有哪些比赛？",
      "最近一轮的比分是什么？",
      "帮我预测一下下一场谁会赢？",
    ];
  }

  private handleStandings(): AgentResponse {
    const standings = this.standingsService.getStandings();
    if (standings.length === 0) {
      return {
        reply: "目前还没有积分数据，请等待比赛开始后再来查看。",
        intent: "standings",
      };
    }

    const top3 = standings
      .slice(0, 3)
      .map(
        (s, i) =>
          `${i + 1}. ${s.teamNameZh}(${s.shortName}) - ${s.points}分 (${s.played}场 ${s.wins}胜 ${s.draws}平 ${s.losses}负)`,
      )
      .join("\n");

    return {
      reply: `📊 当前世界杯积分榜 TOP 3：\n\n${top3}\n\n💡 你可以在积分榜页面查看完整排名。`,
      intent: "standings",
      data: standings.slice(0, 5),
    };
  }

  private handleTeamInfo(message: string): AgentResponse {
    const teams = this.teamService.list();
    const lower = message.toLowerCase();

    // Try to match a team from the message
    const matched = teams.find(
      (t) =>
        lower.includes(t.name.toLowerCase()) ||
        lower.includes(t.nameZh) ||
        lower.includes(t.shortName.toLowerCase()),
    );

    if (!matched) {
      return {
        reply: `我找到了 ${teams.length} 支世界杯参赛球队，包括：${teams.map((t) => t.nameZh).join("、")}。你想了解哪支球队？`,
        intent: "team_info",
      };
    }

    const matches = this.matchService.getByTeam(matched.id);
    const finished = matches.filter((m) => m.status === "finished").slice(-3);
    const upcoming = matches
      .filter((m) => m.status === "scheduled")
      .slice(0, 3);

    let reply = `⚽ ${matched.nameZh} (${matched.name})\n`;
    reply += `🏟 主场：${matched.stadium}\n`;
    reply += `📅 成立于：${matched.founded} 年\n\n`;

    if (finished.length > 0) {
      reply += "最近比赛结果：\n";
      finished.forEach((m) => {
        reply += `  · 第${m.matchday}轮 ${m.homeTeam.shortName} ${m.homeScore}-${m.awayScore} ${m.awayTeam.shortName}\n`;
      });
    }

    if (upcoming.length > 0) {
      reply += "\n即将进行的比赛：\n";
      upcoming.forEach((m) => {
        const d = new Date(m.matchDate).toLocaleDateString("zh-CN");
        reply += `  · ${d} ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}\n`;
      });
    }

    return { reply, intent: "team_info", data: matched };
  }

  private handleUpcoming(): AgentResponse {
    const upcoming = this.matchService.listUpcoming(5);
    if (upcoming.length === 0) {
      return { reply: "目前没有即将进行的比赛。", intent: "upcoming_matches" };
    }

    const lines = upcoming.map((m) => {
      const d = new Date(m.matchDate).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
      return `📅 ${d} · 第${m.matchday}轮：${m.homeTeam.nameZh} vs ${m.awayTeam.nameZh}`;
    });

    return {
      reply: `📋 接下来 ${upcoming.length} 场比赛：\n\n${lines.join("\n")}\n\n💡 去赛事页面可以查看完整赛程并做出预测！`,
      intent: "upcoming_matches",
      data: upcoming.slice(0, 5),
    };
  }

  private handleResults(): AgentResponse {
    const finished = this.matchService.list({ status: "finished" });
    if (finished.length === 0) {
      return { reply: "目前还没有完成的比赛。", intent: "match_result" };
    }

    const latest = finished.slice(-6);
    const lines = latest.map(
      (m) =>
        `📅 第${m.matchday}轮：${m.homeTeam.shortName} ${m.homeScore}-${m.awayScore} ${m.awayTeam.shortName}`,
    );

    return {
      reply: `⚡ 最近完成的比赛：\n\n${lines.join("\n")}\n\n💬 点击比赛可以参与赛后讨论！`,
      intent: "match_result",
      data: latest,
    };
  }

  private handlePredictionHelp(): AgentResponse {
    const upcoming = this.matchService.listUpcoming(3);
    if (upcoming.length === 0) {
      return {
        reply: "目前没有可以预测的比赛。请等待赛程发布后再来！",
        intent: "prediction_help",
      };
    }

    const matches = upcoming.map((m) => {
      const d = new Date(m.matchDate).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
      return `  · ${d} ${m.homeTeam.nameZh} vs ${m.awayTeam.nameZh} (比赛ID: ${m.id})`;
    });

    return {
      reply: `🔮 以下比赛可以预测：\n\n${matches.join("\n")}\n\n💡 在赛事详情页输入你的预测比分即可参与！`,
      intent: "prediction_help",
      data: upcoming,
    };
  }

  private handleGreeting(_message: string, userName: string): AgentResponse {
    return {
      reply: `👋 你好 ${userName}！我是世界杯赛事助手 WorkBuddy。\n\n我可以帮你：\n· 📊 查看积分榜排名\n· ⚽ 了解球队信息\n· 📅 查看赛程安排\n· 📋 查看比赛结果\n· 🔮 参与比分预测\n\n有什么我可以帮你的？`,
      intent: "greeting",
    };
  }

  private handleUnknown(): AgentResponse {
    return {
      reply:
        '抱歉，我没有完全理解你的问题。你可以尝试问我：\n\n· 📊 "积分榜排名"\n· ⚽ "凯尔特人怎么样"\n· 📅 "接下来有什么比赛"\n· 📋 "最近比分是什么"\n· 🔮 "帮我预测"',
      intent: "unknown",
    };
  }
}
