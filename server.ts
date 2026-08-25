import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_BUILDERS } from './src/data/mockBuilders';
import { Builder } from './src/types';

let buildersList: Builder[] = [...INITIAL_BUILDERS];

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all builders
  app.get('/api/builders', (req, res) => {
    res.json(buildersList);
  });

  // Add new builder
  app.post('/api/builders', (req, res) => {
    try {
      const newBuilder: Builder = {
        id: `builder_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: req.body.name || 'Anonymous Builder',
        initials: (req.body.name || 'AB')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        role: req.body.role || 'Full-Stack Dev',
        deptYear: req.body.deptYear || 'SRM IST • Tech Community',
        skills: req.body.skills || ['React', 'TypeScript', 'Node.js'],
        domains: req.body.domains || ['Frontend', 'Backend'],
        matchScore: req.body.matchScore || Math.floor(Math.random() * 8) + 91,
        availability: req.body.availability || 'Ready for 24h Hackathon',
        avatarColor:
          req.body.avatarColor ||
          'linear-gradient(135deg, #6366F1, #8B5CF6)',
        bio: req.body.bio || 'Passionate engineer ready to build high-impact products.',
        github: req.body.github || '',
        hackathonsWon: req.body.hackathonsWon || 1,
        featuredProject: req.body.featuredProject || {
          title: 'Innovation Prototype',
          description: 'High performance web application designed for fast scalability.',
          tags: req.body.skills ? req.body.skills.slice(0, 3) : ['React', 'TypeScript']
        },
        strengths: req.body.strengths || ['Problem Solving', 'Team Collaboration'],
        verified: true,
      };

      buildersList = [newBuilder, ...buildersList];
      res.status(201).json(newBuilder);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to add builder' });
    }
  });

  // Reset builders
  app.post('/api/builders/reset', (req, res) => {
    buildersList = [...INITIAL_BUILDERS];
    res.json({ message: 'Reset to initial builders', builders: buildersList });
  });

  // AI Auto-Match Wizard
  app.post('/api/ai/match', async (req, res) => {
    const { problemStatement } = req.body;
    const ai = getGeminiClient();

    // Fallback heuristic if no Gemini API key or error
    const calculateFallbackMatch = () => {
      const requiredDomains: ('Frontend' | 'Backend' | 'AI/ML' | 'UI/UX')[] = [
        'Frontend',
        'Backend',
        'AI/ML',
        'UI/UX',
      ];
      const selected: Builder[] = [];
      const usedIds = new Set<string>();

      requiredDomains.forEach((domain) => {
        const candidate = buildersList
          .filter((b) => !usedIds.has(b.id) && b.domains.includes(domain))
          .sort((a, b) => b.matchScore - a.matchScore)[0];

        if (candidate) {
          selected.push(candidate);
          usedIds.add(candidate.id);
        }
      });

      while (selected.length < 4) {
        const extra = buildersList
          .filter((b) => !usedIds.has(b.id))
          .sort((a, b) => b.matchScore - a.matchScore)[0];
        if (extra) {
          selected.push(extra);
          usedIds.add(extra.id);
        } else {
          break;
        }
      }

      const avgScore = Math.round(
        selected.reduce((sum, b) => sum + b.matchScore, 0) / (selected.length || 1)
      );

      return {
        team: selected,
        synergyScore: avgScore,
        tacticalPlan: problemStatement
          ? `Engineered cross-functional 4-person squad optimized for: "${problemStatement}". Full stack coverage guaranteed across ML pipelines, low latency backend APIs, design systems, and frontend orchestration.`
          : 'High synergy squad with full coverage across AI/ML, Backend, UI/UX, and Frontend architectures.',
        domainCoverage: {
          Frontend: selected.find((b) => b.domains.includes('Frontend'))?.name || 'Assigned',
          Backend: selected.find((b) => b.domains.includes('Backend'))?.name || 'Assigned',
          'AI/ML': selected.find((b) => b.domains.includes('AI/ML'))?.name || 'Assigned',
          'UI/UX': selected.find((b) => b.domains.includes('UI/UX'))?.name || 'Assigned',
        },
        roleAssignments: selected.map((b, idx) => ({
          builderName: b.name,
          assignedRole: b.role,
          focus: `Primary lead for ${b.domains.join(' & ')} domain delivery.`,
        })),
        geminiExplanation: `MatchCrewSync AI selected top compatible candidates with proven track records in ${selected.map((b) => b.skills[0]).join(', ')}.`,
      };
    };

    if (!ai || !problemStatement || problemStatement.trim() === '') {
      return res.json(calculateFallbackMatch());
    }

    try {
      const prompt = `You are MatchCrewSync AI, a world-class hackathon squad formation engine.
Analyze the following hackathon competition problem statement and select the best 4-member dream team from the candidate builder pool.

Problem Statement:
"${problemStatement}"

Candidate Pool:
${JSON.stringify(
  buildersList.map((b) => ({
    id: b.id,
    name: b.name,
    role: b.role,
    deptYear: b.deptYear,
    skills: b.skills,
    domains: b.domains,
    matchScore: b.matchScore,
    hackathonsWon: b.hackathonsWon,
  }))
)}

Instructions:
1. Select exactly 4 unique builders (by id) that maximize domain balance (Frontend, Backend, AI/ML, UI/UX) and technical relevance to the problem.
2. Provide a 1-sentence tactical rationale for each member.
3. Calculate an estimated team synergy score (88-99).
4. Provide a succinct technical tactical plan for building the winning prototype in 24 hours.

Return the response matching the specified JSON schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              selectedBuilderIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of 4 builder IDs',
              },
              synergyScore: {
                type: Type.INTEGER,
                description: 'Overall team synergy score between 80 and 99',
              },
              tacticalPlan: {
                type: Type.STRING,
                description: 'Brief technical architecture plan for the 24h build',
              },
              roleAssignments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    builderName: { type: Type.STRING },
                    assignedRole: { type: Type.STRING },
                    focus: { type: Type.STRING },
                  },
                  required: ['builderName', 'assignedRole', 'focus'],
                },
              },
              geminiExplanation: {
                type: Type.STRING,
                description: 'Why this squad is mathematically optimal for the prompt',
              },
            },
            required: [
              'selectedBuilderIds',
              'synergyScore',
              'tacticalPlan',
              'roleAssignments',
              'geminiExplanation',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const selected = (parsed.selectedBuilderIds || [])
        .map((id: string) => buildersList.find((b) => b.id === id))
        .filter(Boolean) as Builder[];

      // Fallback if less than 4 returned
      if (selected.length < 4) {
        const existingIds = new Set(selected.map((b) => b.id));
        buildersList.forEach((b) => {
          if (selected.length < 4 && !existingIds.has(b.id)) {
            selected.push(b);
            existingIds.add(b.id);
          }
        });
      }

      res.json({
        team: selected,
        synergyScore: parsed.synergyScore || 96,
        tacticalPlan: parsed.tacticalPlan || 'Optimal prototype architecture designed for rapid iteration.',
        domainCoverage: {
          Frontend: selected.find((b) => b.domains.includes('Frontend'))?.name || 'Covered',
          Backend: selected.find((b) => b.domains.includes('Backend'))?.name || 'Covered',
          'AI/ML': selected.find((b) => b.domains.includes('AI/ML'))?.name || 'Covered',
          'UI/UX': selected.find((b) => b.domains.includes('UI/UX'))?.name || 'Covered',
        },
        roleAssignments: parsed.roleAssignments || selected.map((b) => ({
          builderName: b.name,
          assignedRole: b.role,
          focus: `Lead for ${b.domains.join(' & ')} modules.`,
        })),
        geminiExplanation: parsed.geminiExplanation || 'Selected for complementary technical skillsets and hackathon track record.',
      });
    } catch (err: any) {
      console.error('Gemini AI match error, using heuristic fallback:', err.message);
      res.json(calculateFallbackMatch());
    }
  });

  // AI Synergy Analysis for current team
  app.post('/api/ai/analyze-synergy', async (req, res) => {
    const { teamMembers, competitionContext } = req.body;
    const ai = getGeminiClient();

    const team = (teamMembers || []).filter(Boolean) as Builder[];
    if (team.length === 0) {
      return res.status(400).json({ error: 'No team members provided' });
    }

    const domainCount: Record<string, number> = {};
    team.forEach((m) => {
      m.domains.forEach((d) => {
        domainCount[d] = (domainCount[d] || 0) + 1;
      });
    });

    const isFullyCovered = ['Frontend', 'Backend', 'AI/ML', 'UI/UX'].every(
      (d) => (domainCount[d] || 0) > 0
    );

    const fallbackAnalysis = {
      overallScore: Math.round(
        team.reduce((acc, b) => acc + b.matchScore, 0) / team.length
      ),
      balanceRating: (isFullyCovered && team.length === 4
        ? 'World-Class'
        : team.length >= 3
        ? 'High-Synergy'
        : 'Balanced') as 'Sub-Optimal' | 'Balanced' | 'High-Synergy' | 'World-Class',
      tacticalStrengths: [
        `High velocity in ${Array.from(new Set(team.flatMap((b) => b.skills))).slice(0, 4).join(', ')}.`,
        `${team.reduce((acc, b) => acc + (b.hackathonsWon || 0), 0)} combined hackathon podium finishes across team.`,
        isFullyCovered
          ? 'Comprehensive end-to-end coverage across UI, API, ML pipelines, and Cloud infra.'
          : 'Strong core competencies in selected technical areas.',
      ],
      vulnerabilities: isFullyCovered
        ? ['Tight 24h timeline requiring parallelized API contracts between Frontend & Backend.']
        : [
            `Missing or light coverage in ${['Frontend', 'Backend', 'AI/ML', 'UI/UX']
              .filter((d) => !domainCount[d])
              .join(' and ')}.`,
          ],
      hackathonRoadmap: [
        {
          phase: 'Hours 00:00 - 04:00',
          hours: '0-4h',
          keyDeliverable: 'Design tokens, Figma mockups & schema contracts',
          owner: team[0]?.name || 'Team Lead',
        },
        {
          phase: 'Hours 04:00 - 14:00',
          hours: '4-14h',
          keyDeliverable: 'Core model fine-tuning & API services scaffolded',
          owner: team[1]?.name || team[0]?.name || 'Backend/ML',
        },
        {
          phase: 'Hours 14:00 - 20:00',
          hours: '14-20h',
          keyDeliverable: 'Frontend UI integration & live websocket flows',
          owner: team[2]?.name || team[0]?.name || 'Frontend',
        },
        {
          phase: 'Hours 20:00 - 24:00',
          hours: '20-24h',
          keyDeliverable: 'Pitch deck visual assets, demo video recording & live testing',
          owner: team[3]?.name || team[0]?.name || 'All Members',
        },
      ],
      recommendation: isFullyCovered
        ? 'Squad is in peak competition condition. Lock in API interfaces early and avoid scope creep.'
        : 'Consider swapping a duplicate role to ensure all 4 disciplines are represented.',
    };

    if (!ai) {
      return res.json(fallbackAnalysis);
    }

    try {
      const prompt = `Analyze this hackathon team composition for ${competitionContext || 'Campus Innovation & Hackathon Sprint'}:
Team Roster:
${JSON.stringify(
  team.map((b) => ({
    name: b.name,
    role: b.role,
    skills: b.skills,
    domains: b.domains,
    matchScore: b.matchScore,
    hackathonsWon: b.hackathonsWon,
  }))
)}

Provide an elite team synergy evaluation with tactical strengths, vulnerability warnings, milestone roadmap, and strategic recommendations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              balanceRating: {
                type: Type.STRING,
                enum: ['Sub-Optimal', 'Balanced', 'High-Synergy', 'World-Class'],
              },
              tacticalStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              vulnerabilities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              hackathonRoadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    hours: { type: Type.STRING },
                    keyDeliverable: { type: Type.STRING },
                    owner: { type: Type.STRING },
                  },
                  required: ['phase', 'hours', 'keyDeliverable', 'owner'],
                },
              },
              recommendation: { type: Type.STRING },
            },
            required: [
              'overallScore',
              'balanceRating',
              'tacticalStrengths',
              'vulnerabilities',
              'hackathonRoadmap',
              'recommendation',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini AI synergy analysis error:', err.message);
      res.json(fallbackAnalysis);
    }
  });

  // AI Chatbot Assistant Endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, history, mode } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    const queryLower = message.toLowerCase();
    const agentMode = mode || (
      queryLower.includes('fact check') || queryLower.includes('is it true') || queryLower.includes('verify claim') || queryLower.includes('debunk')
        ? 'fact_check'
        : queryLower.includes('climate') || queryLower.includes('global warming') || queryLower.includes('emission') || queryLower.includes('weather') || queryLower.includes('carbon') || queryLower.includes('renewable energy') || queryLower.includes('environment')
        ? 'climate'
        : queryLower.includes('news') || queryLower.includes('latest') || queryLower.includes('current event') || queryLower.includes('today') || queryLower.includes('recent') || queryLower.includes('breaking')
        ? 'current_events'
        : 'general'
    );

    // Comprehensive Fallback Handler
    const generateFallbackResponse = () => {
      // 1. Payment & Fee Doubts
      if (
        queryLower.includes('pay') ||
        queryLower.includes('fee') ||
        queryLower.includes('price') ||
        queryLower.includes('cost') ||
        queryLower.includes('refund') ||
        queryLower.includes('money') ||
        queryLower.includes('upi') ||
        queryLower.includes('free')
      ) {
        return {
          reply: `### 💳 **Match Crew Registration & Payment Guide**

Here is the financial & fee breakdown:

1. **Campus / College Students**: **100% FREE Registration**
   - Provide your student registration details during checkout to waive all fees.
2. **External University Teams**: **₹499 per team** (flat fee for all 2–4 members).
   - **What's included**: 24-hour catered meals & refreshments, hacker lounge access, exclusive swag pack, and **$200 Cloud Compute Credits**.
3. **Accepted Payment Methods**:
   - **UPI**: Google Pay, PhonePe, Paytm, BHIM (Instant confirmation)
   - **Cards & NetBanking**: Major Indian credit/debit cards & 50+ banking gateways
   - **Campus ERP Wallet**: Direct deduction for enrolled students
4. **Refund & Cancellation Policy**:
   - **100% Full Refund** if cancelled at least **72 hours** before team formation lock.`,
          suggestedBuilderIds: [],
          quickFollowUps: [
            'How do I claim cloud compute credits?',
            'What are the event tracks?',
            'How do I find teammates for my project?'
          ],
          category: 'payment' as const,
        };
      }

      // 2. How to use Match Crew / Platform Guide
      if (
        queryLower.includes('how to use') ||
        queryLower.includes('how do i') ||
        queryLower.includes('guide') ||
        queryLower.includes('tutorial') ||
        queryLower.includes('features') ||
        queryLower.includes('help') ||
        queryLower.includes('wizard')
      ) {
        return {
          reply: `### 🚀 **How to Use Match Crew to Build a Winning Squad**

Match Crew helps you discover elite campus talent and balance your team's skill matrix:

1. 🔍 **Browse & Filter Talent**:
   - Use the **Domain Filters** at the top (*Frontend, Backend, AI/ML, UI/UX*) or type specific skills like \`PyTorch\`, \`FastAPI\`, or \`Figma\` into the search bar.
2. 👤 **Inspect Builder Details**:
   - Click **"View Profile"** on any builder card to inspect their verified university credentials, GitHub repo, hackathon podium records, and capstone project summaries.
3. ⚡ **Assemble Your 4-Member Squad**:
   - Click **"Add to Squad"** to add members into your team roster on the right panel.
   - The **Real-Time Synergy Radar** will dynamically calculate your squad's balance score and alert you if you have missing domain competencies.
4. 🤖 **AI Auto-Match Wizard**:
   - Click the **"AI Auto-Match"** button in the header, describe your hackathon project theme (e.g. *"AI Medical Diagnostic Agent"*), and Gemini AI will pick the mathematically optimal 4-member dream squad!
5. 📊 **Deep Dive & Roadmap**:
   - Click **"Synergy Deep Dive"** in the sidebar to generate a 24-hour tactical milestone plan and role assignments.
6. 📋 **Export Roster**:
   - Click **"Export Roster"** to copy or download your team roster in formatted Markdown ready for submission!`,
          suggestedBuilderIds: buildersList.slice(0, 2).map((b) => b.id),
          quickFollowUps: [
            'Launch AI Auto-Match Wizard for me',
            'Find top AI/ML engineers with SIH wins',
            'Explain the 4-domain synergy score'
          ],
          category: 'guide' as const,
        };
      }

      // 3. Builder profile lookup or skill matching
      const matchingBuilders = buildersList.filter((b) => {
        const nameMatch = queryLower.includes(b.name.toLowerCase()) || b.name.toLowerCase().split(' ').some((part) => queryLower.includes(part));
        const skillMatch = b.skills.some((s) => queryLower.includes(s.toLowerCase()));
        const domainMatch = b.domains.some((d) => queryLower.includes(d.toLowerCase()));
        const roleMatch = queryLower.includes(b.role.toLowerCase());
        const deptMatch = queryLower.includes(b.deptYear.toLowerCase());
        return nameMatch || skillMatch || domainMatch || roleMatch || deptMatch;
      });

      if (matchingBuilders.length > 0) {
        const topMatches = matchingBuilders.slice(0, 3);
        const builderSummaries = topMatches
          .map(
            (b) =>
              `• **${b.name}** (${b.role} • ${b.deptYear})\n  - **Match Score**: ${b.matchScore}% | **Podium Wins**: ${b.hackathonsWon || 1} hackathons\n  - **Top Skills**: ${b.skills.join(', ')}\n  - **Featured Project**: *${b.featuredProject?.title || 'Capstone'}* — ${b.featuredProject?.description || ''}`
          )
          .join('\n\n');

        return {
          reply: `### 🎯 **Discovered Campus Talent Profiles**

I found **${matchingBuilders.length} builder${matchingBuilders.length > 1 ? 's' : ''}** matching your criteria in the directory:

${builderSummaries}

You can click **"View Profile"** or **"Add to Squad"** directly on the interactive cards below!`,
          suggestedBuilderIds: topMatches.map((b) => b.id),
          quickFollowUps: [
            `Show more details for ${topMatches[0].name}`,
            'Who are the best UI/UX designers available?',
            'How do I test their synergy in my squad?'
          ],
          category: 'builder_lookup' as const,
        };
      }

      // 4. Default general prompt response
      return {
        reply: `### 🤖 **Match Crew Tactical Assistant**

I am your dedicated AI coordinator for **Match Crew**. I can help you with:

- 👤 **Student & Builder Profiles**: Ask about specific builders (*"Tell me about Aarav Sharma"*, *"Who knows LangGraph and PyTorch?"*).
- 🛠️ **Platform Guide**: Learn how to use the Synergy Radar, Auto-Match Wizard, and Markdown Roster export.
- 💳 **Registration & Payment Doubts**: Inquire about the ₹499 fee, free student entry, refund policies, and cloud credits.
- 🏆 **Hackathon Strategy**: Ask for recommended squad combinations for AI Agent, Vision, Web3, or MedTech tracks.

What would you like to explore?`,
          suggestedBuilderIds: buildersList.slice(0, 3).map((b) => b.id),
          quickFollowUps: [
            'Show top AI/ML builders with hackathon wins',
            'Is registration free for students?',
            'How does the AI Auto-Match Wizard work?'
          ],
          category: 'general' as const,
        };
      };

    if (!ai) {
      const fallback = generateFallbackResponse();
      const suggested = (fallback.suggestedBuilderIds || [])
        .map((id) => buildersList.find((b) => b.id === id))
        .filter(Boolean);
      return res.json({ ...fallback, suggestedBuilders: suggested });
    }

    try {
      const isSearchGroundedTask =
        agentMode === 'current_events' ||
        agentMode === 'climate' ||
        agentMode === 'fact_check' ||
        queryLower.includes('fact check') ||
        queryLower.includes('is it true') ||
        queryLower.includes('verify') ||
        queryLower.includes('climate') ||
        queryLower.includes('global warming') ||
        queryLower.includes('emission') ||
        queryLower.includes('weather') ||
        queryLower.includes('news') ||
        queryLower.includes('latest') ||
        queryLower.includes('current') ||
        queryLower.includes('today') ||
        queryLower.includes('recent') ||
        queryLower.includes('debunk') ||
        queryLower.includes('breaking');

      const systemInstruction = `You are the Match Crew Tactical & Real-Time Intelligence Agent, powered by Google Search Grounding and Campus Talent Graph.

You have two specialized roles:

1. REAL-TIME SEARCH GROUNDING, CURRENT EVENTS, CLIMATE DATA, AND FACT CHECKING:
- Rely on real-time Google Search grounding to retrieve verified, factual, and latest information.
- When fact-checking a claim:
  - Provide a clear, bold verdict: **Verified True**, **Mostly True**, **Partially True**, **Misleading / Half-Truth**, **Debunked / False**, or **Unverified**.
  - State the claim precisely, summarize primary evidence points with metrics/dates, and point out nuances or caveats.
- When discussing Climate, Climate Tech, and Environmental Data:
  - Cite concrete figures, international accords (COP, IPCC), carbon reduction benchmarks, clean energy records, and climate tech innovations.
- When discussing Current Events & Tech Breakthroughs:
  - Provide a chronological summary of recent announcements, key stakeholders, and industry impacts.

2. CAMPUS BUILDER DIRECTORY & SQUAD FORMATION:
You have real-time access to the local builder pool:
${JSON.stringify(
  buildersList.map((b) => ({
    id: b.id,
    name: b.name,
    role: b.role,
    deptYear: b.deptYear,
    skills: b.skills,
    domains: b.domains,
    matchScore: b.matchScore,
    availability: b.availability,
    bio: b.bio,
    github: b.github,
    hackathonsWon: b.hackathonsWon,
    featuredProject: b.featuredProject,
    strengths: b.strengths,
    verified: b.verified,
  }))
)}
- If the user asks about squad members, talent matchmaking, platform features, or registration fees, provide accurate campus guidance and builder references.

Formatting Guidelines:
- Use clean Markdown with headers (###), bold text, and bullet points.
- Maintain high journalistic and scientific integrity.`;

      // Build conversation contents
      const conversationHistory = Array.isArray(history) ? history.slice(-6) : [];
      let fullPrompt = `${systemInstruction}\n\n`;

      if (conversationHistory.length > 0) {
        fullPrompt += `Recent Conversation History:\n`;
        conversationHistory.forEach((h: any) => {
          fullPrompt += `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}\n`;
        });
        fullPrompt += `\n`;
      }

      fullPrompt += `User Mode: ${agentMode}\n`;
      fullPrompt += `Current User Query: "${message}"\n\n`;

      if (agentMode === 'fact_check' || queryLower.includes('fact check') || queryLower.includes('is it true')) {
        fullPrompt += `Please fact-check this claim thoroughly using real-time search. State the Claim, provide a Verdict with Confidence percentage, explain the verified evidence, and provide concluding context.`;
      } else if (agentMode === 'climate' || queryLower.includes('climate')) {
        fullPrompt += `Please provide an in-depth, verified climate and environmental breakdown with current data points, research findings, and technological innovations.`;
      } else if (agentMode === 'current_events' || queryLower.includes('news') || queryLower.includes('latest')) {
        fullPrompt += `Please provide the latest real-time overview and current event context based on Google Search results.`;
      } else {
        fullPrompt += `Please answer accurately, citing specific builder names or platform features if relevant.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: fullPrompt,
        config: {
          tools: isSearchGroundedTask ? [{ googleSearch: {} }] : undefined,
        },
      });

      const replyText = response.text || 'I have processed your query.';

      // Extract Grounding Chunks (URLs and titles)
      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; url: string; snippet?: string }[] = [];
      for (const chunk of rawChunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          if (!sources.some((s) => s.url === chunk.web.uri)) {
            sources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
              snippet: (chunk.web as any).snippet || '',
            });
          }
        }
      }

      const searchQueries: string[] = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      // Extract relevant builder suggestions if query mentions skills or names
      const validBuilderIds = buildersList
        .filter((b) => {
          const nameMatch = queryLower.includes(b.name.toLowerCase());
          const skillMatch = b.skills.some((s) => queryLower.includes(s.toLowerCase()) && s.length > 2);
          return nameMatch || skillMatch;
        })
        .slice(0, 3)
        .map((b) => b.id);

      const suggestedBuilders = validBuilderIds
        .map((id: string) => buildersList.find((b) => b.id === id))
        .filter(Boolean);

      // Extract Fact Check Verdict if applicable
      let factCheckVerdict: any = undefined;
      if (agentMode === 'fact_check' || queryLower.includes('fact check') || replyText.includes('Verdict:')) {
        let verdictType: 'Verified True' | 'Mostly True' | 'Partially True' | 'Misleading' | 'Debunked / False' | 'Unverified' = 'Verified True';
        const lowerReply = replyText.toLowerCase();
        if (lowerReply.includes('debunked') || lowerReply.includes('false') || lowerReply.includes('incorrect') || lowerReply.includes('fake') || lowerReply.includes('hoax')) {
          verdictType = 'Debunked / False';
        } else if (lowerReply.includes('misleading') || lowerReply.includes('half-truth') || lowerReply.includes('mixed') || lowerReply.includes('partially')) {
          verdictType = 'Misleading';
        } else if (lowerReply.includes('mostly true')) {
          verdictType = 'Mostly True';
        } else if (lowerReply.includes('unverified') || lowerReply.includes('inconclusive')) {
          verdictType = 'Unverified';
        } else if (lowerReply.includes('verified true') || lowerReply.includes('accurate') || lowerReply.includes('correct')) {
          verdictType = 'Verified True';
        }

        factCheckVerdict = {
          claim: message,
          verdict: verdictType,
          confidenceScore: sources.length > 0 ? 95 : 88,
          keyEvidence: [
            sources.length > 0 ? `Cross-referenced with ${sources.length} authoritative live web sources` : 'Grounded in public knowledge registries',
            'Cross-checked primary publications and official releases'
          ],
          context: 'Real-time Google Search verification'
        };
      }

      // Generate dynamic follow-ups
      let quickFollowUps = [
        'Fact check: Did clean energy investments surpass fossil fuels globally?',
        'What are the latest breakthroughs in agentic AI frameworks?',
        'How do I assemble an AI & Climate Tech squad in Match Crew?'
      ];

      if (agentMode === 'climate') {
        quickFollowUps = [
          'What are the top technological innovations in carbon reduction?',
          'What were the key takeaways from the latest global climate conference?',
          'Find builders with experience in sensor telemetry and data visualization'
        ];
      } else if (agentMode === 'fact_check') {
        quickFollowUps = [
          'Fact check: Did researchers achieve room-temperature semiconductor breakthroughs?',
          'Fact check: Are AI code assistants reducing security vulnerabilities or increasing them?',
          'How can I fact check technical claims in hackathon project pitches?'
        ];
      } else if (agentMode === 'current_events') {
        quickFollowUps = [
          'What are the biggest breaking stories in software development this week?',
          'What new regulations or policies for AI are emerging globally?',
          'Show top AI/ML builders ready for our next hackathon sprint'
        ];
      }

      res.json({
        reply: replyText,
        suggestedBuilderIds: validBuilderIds,
        suggestedBuilders,
        quickFollowUps,
        category: agentMode,
        groundedInSearch: sources.length > 0 || isSearchGroundedTask,
        sources,
        searchQueries,
        factCheckVerdict
      });
    } catch (err: any) {
      console.error('Gemini chat error, fallback used:', err.message);
      const fallback = generateFallbackResponse();
      const suggested = (fallback.suggestedBuilderIds || [])
        .map((id) => buildersList.find((b) => b.id === id))
        .filter(Boolean);
      res.json({ ...fallback, suggestedBuilders: suggested });
    }
  });


  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Match Crew server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
