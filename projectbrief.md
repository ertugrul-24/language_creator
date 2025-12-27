# Project Brief

## Executive Summary

**LinguaFabric** is a collaborative language creation platform enabling users to design constructed languages, build dictionaries and grammar systems, create language courses, and collaborate with friends. The MVP (Phase 1) launches March 20, 2026, focusing on single-user language creation with collaborative foundations.

### Key Metrics
- **Target Launch:** March 20, 2026
- **MVP Scope:** Language creation + dictionary + single-user courses
- **Phase 2 (Collaboration):** May 15, 2026
- **Estimated DAU at 6 months:** 500 active creators
- **Estimated revenue at 12 months:** $15,000 - $40,000 MRR (pro subscriptions)

---

## Problem Statement

### Current Market Gaps

1. **Language Hobbyists** struggle to organize constructed language projects
   - No integrated tools for conlangs
   - Scattered documentation (spreadsheets, Google Docs, personal wikis)
   - No standardized workflow
   - Hard to share work with other enthusiasts

2. **Language Teachers** lack tools to teach constructed languages
   - Conlangs taught informally through Discord/forums
   - No curriculum structure
   - No progress tracking for students
   - Cannot monetize teaching

3. **Collaborative Creators** cannot easily work together
   - No real-time collaboration tools
   - Permission management complex
   - Activity tracking non-existent
   - Contribution disputes common

### Opportunity

- **Global Conlang Community:** ~50,000 active creators worldwide (Reddit r/conlangs: 47K members)
- **Education Market:** Language learning platforms (Duolingo: $750M valuation) show demand
- **Content Creator Economy:** Creators want to monetize niche knowledge
- **Untapped Niche:** No integrated tooling specifically for conlangs

---

## Product Vision

**Empower language creators** to design, document, teach, and collaborate on constructed languages through an intuitive, community-driven platform.

### Core Values

1. **Accessibility** - Easy for beginners, powerful for experts
2. **Collaboration** - Built for teamwork from day one
3. **Creativity** - Support any language design paradigm
4. **Community** - Foster connections between creators

---

## Features by Phase

### Phase 0 (Foundation) ✅ COMPLETE
- React 18 + TypeScript project initialization
- Tailwind CSS with dark mode
- Basic component system (Header, Sidebar, PageShell)
- React Router with placeholder pages
- Firebase configuration ready
- Development environment setup

### Phase 1 (MVP Core) — Feb 15 - Mar 20, 2026
**Goal:** Single-user language creation and course building

**Features:**
- User authentication (Google OAuth + Email/Password)
- Language creation wizard
  - Name, description, icon, cover image
  - Linguistic specifications (alphabet, word order, phoneme set, depth level)
  - Real-time validation
- Dictionary management
  - Add/edit/delete words
  - Word parts of speech, pronunciation (IPA), audio
  - Etymology and usage examples
  - Bulk import from CSV
  - Search and filter
- Grammar rules system
  - Create rules by category (morphology, phonology, syntax, pragmatics)
  - Pattern matching and examples
  - Rule editor with real-time preview
- Basic courses (single-user)
  - Lesson creation with markdown content
  - Flashcard system
  - Quiz builder with multiple question types
  - Progress tracking for personal review
- User dashboard
  - Statistics cards (total words, rules, projects)
  - Recent activity feed
  - Quick-start templates for language types

### Phase 2 (Collaboration) — Mar 20 - May 15, 2026
**Goal:** Real-time collaborative editing and social features

**Features:**
- Collaboration system
  - Invite other creators to languages
  - Role-based permissions (owner, editor, viewer)
  - Real-time activity feed
  - Conflict resolution UI
- Friend system
  - User discovery / search
  - Friend requests / invitations
  - Activity visibility permissions
- Shared courses
  - Publish courses publicly
  - Enrollment tracking
  - Student progress management
- Community features
  - Public language gallery
  - Trending / popular languages
  - Language templates marketplace
- Notifications
  - Collaboration invites
  - Friend requests
  - Course enrollment
  - Edit notifications (real-time)

### Phase 3 (Monetization) — May 15 - Jun 30, 2026
**Goal:** Enable creators to earn from courses and premium features

**Features:**
- Pro subscription
  - Unlimited courses (free: 3 max)
  - Unlimited collaborators (free: 3 max)
  - Advanced analytics on course enrollment
  - Custom course branding
  - Course revenue share (70/30 platform split)
- Payment processing (Stripe)
- Revenue dashboard
- Course analytics
  - Student engagement metrics
  - Completion rates
  - Time spent per lesson

### Phase 4 (Platform Growth) — Jul+ 2026
**Goal:** Scale community and add advanced features

**Features:**
- AI-powered features
  - Phoneme suggestion based on parameters
  - Auto-generated example phrases
  - Translation helper with DeepL API
  - Grammar anomaly detection
- Advanced collaboration
  - Version control / history
  - Branching for language variants
  - Commenting and reviews
- Mobile app (React Native)
- Offline support (PWA)
- API for integrations

---

## Business Model

### Revenue Streams

| Stream | Mechanism | Timeline | Projected Revenue |
|--------|-----------|----------|------------------|
| **Pro Subscriptions** | $9.99/month for unlimited features | Phase 3 | $15K-$40K MRR at 12 mo |
| **Course Revenue Share** | 30% platform cut on paid courses | Phase 3 | $5K-$15K MRR at 12 mo |
| **Enterprise / Teams** | $29.99/month for org accounts (future) | Phase 4+ | $10K+ MRR potential |
| **API Access** | $99-$299/month for platform API (future) | Phase 4+ | $5K+ MRR potential |

### Pricing Strategy

**Free Tier:**
- 3 languages
- 3 collaborators per language
- Unlimited dictionary/grammar entries
- 3 courses
- 1 enrolled student per course (for course preview)
- Community features (view public languages)

**Pro Tier ($9.99/month):**
- Unlimited languages and collaborators
- Unlimited courses
- Student enrollment (up to 100 per course free, then $1 per additional)
- Advanced course analytics
- Custom course branding
- Export/backup tools
- Priority support

**Pro Course Earnings:**
- Platform takes 30% of course enrollment fees
- Creator sets own pricing ($0-$99 per course)
- Payout monthly via Stripe

### Unit Economics (Projected at 12 months)

**Assumptions:**
- 500 active pro users paying $9.99/month = $80K MRR
- 5% of pro users create paid courses at avg $15 revenue each = $37.5K MRR
- Platform takes 30% cut on courses = $11.25K MRR
- Total projected MRR: ~$91.25K

**Cost Structure:**
- Firebase costs: ~$2K-$5K MRR
- DeepL API: ~$1K-$2K MRR
- Stripe processing: ~1.5% of revenue = $1.3K MRR
- DevOps/Infrastructure: ~$1K MRR
- Marketing/Customer acquisition: ~10% of revenue = $9K MRR
- **Total costs: ~$15K-$17K MRR**
- **Gross margin: ~80-84%**

---

## Competitive Analysis

### Direct Competitors

| Product | Strengths | Weaknesses | LinguaFabric Advantage |
|---------|-----------|-----------|----------------------|
| **Arthaey.com** | Known in conlang community | Static, outdated, no tools | Real-time, collaborative, dynamic |
| **Wixoss World Builder** | Inspired by conlangs | Not language-specific | Specialized for languages |
| **Duolingo** | Huge user base, course system | Built for natural languages | Purpose-built for conlangs |
| **Google Docs** | Everyone knows it | No language-specific UX | Specialized tools, UX |

### Indirect Competitors

- **Markdown wikis** (Notion, Obsidian) - Note-taking, not designed for language work
- **Google Sheets** - Spreadsheets, not collaborative for languages
- **Discord communities** - Social, not structured tools

### LinguaFabric's Competitive Advantages

1. **Specialized for Conlangs** - Purpose-built vs. generic tools
2. **Collaborative from Day One** - Real-time editing and permissions
3. **Integrated Ecosystem** - Dictionary + grammar + courses in one platform
4. **Course Monetization** - Teachers can earn
5. **Active Community** - Social discovery and sharing
6. **Modern UX** - Tailwind design, responsive, dark mode
7. **Accessibility** - Beginner-friendly with expert features

---

## Launch Strategy

### Phase 1 MVP Launch (Mar 20, 2026)

**Pre-Launch (Feb 20 - Mar 19):**
- Beta access for 50 community members (r/conlangs, Conlang Discord)
- Feedback collection and iteration
- Onboarding tutorial creation
- Email list building

**Day 1 Launch:**
- Post on r/conlangs (50K members)
- HackerNews Show HN: (target 500-1000 upvotes)
- Product Hunt submission (target top 5)
- Blog post about conlang community problem

**Weeks 2-4:**
- Guest posts on language-focused blogs
- Interviews on conlang podcasts
- Community Discord outreach
- YouTube demo video (target 10K views)

**Target Metrics (30 days post-launch):**
- 1,000 signed-up users
- 200 active language creators
- 500+ languages created
- 10,000 dictionary entries
- 50% weekly retention

### Phase 2 Collaboration Launch (May 15, 2026)

**Marketing Focus:**
- Case studies from Phase 1 early adopters
- Feature announcement on conlang communities
- Influencer partnerships (conlang YouTubers)
- Target: 3,000 total users, 10% on pro

### Phase 3 Monetization Launch (Jun 30, 2026)

**Marketing Focus:**
- Pro value proposition (unlimited courses, collaborators)
- Course creator success stories
- Email campaigns to active users
- Referral program ($10 credit for referrer + referred)

---

## Success Metrics

### Acquisition Metrics
- Monthly user signups
- Signup-to-creator conversion rate
- Channel attribution (organic, PH, HN, social, etc.)

### Engagement Metrics
- DAU / MAU
- Weekly retention (Day 7, Day 30)
- Average languages created per user
- Average words per language
- Time spent in app

### Monetization Metrics
- Pro subscription conversion rate (target: 5-10%)
- ARPU (average revenue per user)
- MRR growth rate
- Course enrollment rate
- Course revenue per creator

### Community Metrics
- Languages created
- Dictionary entries
- Courses published
- Collaborations initiated
- User-generated content volume

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Low market demand** | Medium | High | User research in Phase 0, early beta feedback |
| **Firebase costs spike** | Medium | Medium | Cost monitoring, optimize queries, caching |
| **User churn post-launch** | Medium | High | Engagement features, community building, onboarding |
| **Collaboration complexity** | High | High | Phased approach (solo first), technical spike in Phase 1 |
| **Regulatory (GDPR/CCPA)** | Low | High | Legal consultation, privacy-by-design |
| **Competitor emerges** | Low | Medium | Build fast, strong community moat, monetize early |

---

## Timeline Overview

```
Dec 27, 2025  │ Phase 0 COMPLETE ✅
              │
Jan - Feb 26  │ Phase 1 Development (Language creation core)
Feb 20-Mar 19 │ Phase 1 Beta testing (50 community members)
Mar 20, 2026  │ Phase 1 Launch (MVP)
              │
Mar 20-May 15 │ Phase 2 Development (Collaboration)
May 15, 2026  │ Phase 2 Launch (Sharing & collaboration)
              │
May 15-Jun 30 │ Phase 3 Development (Monetization)
Jun 30, 2026  │ Phase 3 Launch (Pro subscriptions)
              │
Jul+ 2026     │ Phase 4 (Growth features, mobile, API)
```

---

## Success Criteria for Each Phase

### Phase 1 Success (MVP)
- ✅ 1,000+ signups within 30 days of launch
- ✅ 200+ active creators (created 1+ language)
- ✅ 50%+ Day 7 retention
- ✅ 500+ languages created
- ✅ Positive qualitative feedback from community

### Phase 2 Success (Collaboration)
- ✅ 3,000+ total users
- ✅ 20%+ of languages have 1+ collaborators
- ✅ 500+ friend connections
- ✅ Smooth real-time editing experience

### Phase 3 Success (Monetization)
- ✅ 5-10% pro conversion rate
- ✅ $10K+ MRR from subscriptions and courses
- ✅ 100+ paid courses
- ✅ $50+ average course revenue

---

**Last Updated:** December 27, 2025
**Status:** ✅ Complete - Do not modify after creation
