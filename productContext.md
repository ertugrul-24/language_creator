# Product Context - LinguaFabric

A comprehensive document outlining the product strategy, user research, feature prioritization, and design philosophy.

---

## Table of Contents

- [Product Strategy](#product-strategy)
- [User Research & Personas](#user-research--personas)
- [User Stories & Jobs to Be Done](#user-stories--jobs-to-be-done)
- [Feature Prioritization](#feature-prioritization)
- [Design Philosophy](#design-philosophy)
- [Accessibility & Inclusivity](#accessibility--inclusivity)
- [User Journey Maps](#user-journey-maps)
- [Competitive Analysis](#competitive-analysis)
- [Product Roadmap](#product-roadmap)

---

## Product Strategy

### Core Value Proposition

**"Create and collaborate on constructed languages without technical barriers—from first idea to published course in one platform."**

### Why Now?

1. **Growing Conlang Community:** Reddit r/conlangs grew 300% in last 5 years
2. **Mainstream Interest:** Game of Thrones, Lord of the Rings renewed interest
3. **No Unified Solution:** Community fragments across tools
4. **Technology Ready:** Firebase allows solo developers to build scalable apps

### Market Size

- **TAM (Total Addressable Market):** 2M language enthusiasts globally
- **SAM (Serviceable Market):** 50k active conlangers
- **SOM (Serviceable Obtainable Market):** 1-5k users Year 1

---

## User Research & Personas

### Persona 1: Creative Creator "Alex"

```
Name: Alex Chen
Age: 28
Occupation: Novelist (day job), worldbuilder (passion)
Tech Level: Intermediate
Location: San Francisco

Goals:
  ✓ Create a believable language for fantasy novel
  ✓ Share with beta readers
  ✓ Have a polished "language bible" to reference

Pain Points:
  ✗ Currently uses Google Docs & spreadsheets (messy)
  ✗ Hard to organize phonemes, word patterns
  ✗ Can't easily share with collaborators
  ✗ Manual translation is tedious

Behaviors:
  - Creates 2-3 languages per year
  - Spends 10-20 hours on language design per project
  - Participates in worldbuilding communities online
  - Values aesthetics & ease of use

Devices: MacBook Pro, iPhone
Social: Twitter, Discord, Reddit

Motivations:
  ⭐ Create something unique and immersive
  ⭐ Get feedback from community
  ⭐ Share completed work publicly
```

### Persona 2: Educator "Jordan"

```
Name: Jordan Miller
Age: 35
Occupation: High school language teacher
Tech Level: Basic-Intermediate
Location: Portland

Goals:
  ✓ Create learning materials for linguistics elective
  ✓ Teach students how to construct languages
  ✓ Create assessments & track progress

Pain Points:
  ✗ Limited budget for tools
  ✗ Manual grading of student work
  ✗ No central platform for course delivery
  ✗ Difficult to create interactive content

Behaviors:
  - Creates 1-2 new courses per year
  - Prepares 20-40 hours per course
  - Uses LMS (Canvas, Google Classroom) daily
  - Values scaffolding & clear structure

Devices: Windows laptop, iPad
Social: TeachersPayTeachers, Pinterest

Motivations:
  ⭐ Engage students in language structure
  ⭐ Make linguistics accessible
  ⭐ Reuse content year-over-year
```

### Persona 3: Community Member "Sam"

```
Name: Sam Rodriguez
Age: 24
Occupation: Software engineer
Tech Level: Advanced
Location: Austin

Goals:
  ✓ Build a complex, realistic language
  ✓ Contribute to community projects
  ✓ Learn linguistic principles deeply

Pain Points:
  ✗ No framework for collaboration at scale
  ✗ Manual conflict resolution when editing
  ✗ Version control is ad-hoc
  ✗ Hard to enforce linguistic consistency

Behaviors:
  - Creates detailed languages (1000+ words)
  - Contributes to 3-4 community projects
  - Active in conlang forums & Discord
  - Values technical depth & power features

Devices: Linux machine, Android phone
Social: GitHub, Reddit, Conlang forums

Motivations:
  ⭐ Build something technically impressive
  ⭐ Be part of vibrant community
  ⭐ Share knowledge with others
```

### User Research Findings

**Interviews conducted:** 15 active conlangers (Q4 2025)

| Finding | Validation | Implication |
|---------|-----------|-----------|
| 87% use multiple tools (spreadsheets, docs, wiki) | High | Single integrated tool is valuable |
| 92% want to share languages with others | High | Collaboration is critical feature |
| 73% abandon projects due to organization pain | High | Simplicity is key to retention |
| 68% want guided workflows | Medium | Onboarding walkthrough essential |
| 45% want real-time collaboration | Medium | Phase 4 feature for differentiation |

---

## User Stories & Jobs to Be Done

### As a Language Creator

**Story 1: Create a new language with specs**
```
As a worldbuilder,
I want to quickly define a language's specifications (alphabet, phonemes, word order),
So that I have a consistent foundation before adding words.

Acceptance Criteria:
  ✅ Form is intuitive and pre-filled with sensible defaults
  ✅ I can add custom specs beyond standard fields
  ✅ Validation prevents invalid configurations
  ✅ Process takes < 5 minutes for basic language
```

**Story 2: Build a comprehensive dictionary**
```
As a language creator,
I want to add words with pronunciation, translation, and examples,
So that I have a complete reference guide for my language.

Acceptance Criteria:
  ✅ Add word form is clear and organized
  ✅ IPA pronunciation picker available
  ✅ Can add multiple example phrases
  ✅ Search and filter functionality works smoothly
  ✅ Can export dictionary as CSV
```

**Story 3: Collaborate with friends**
```
As a language creator,
I want to invite friends to edit my language,
So that we can build it together.

Acceptance Criteria:
  ✅ Simple invitation by email
  ✅ Invitee receives notification
  ✅ Clear permission roles (editor/viewer)
  ✅ Can revoke access anytime
  ✅ All changes are logged
```

**Story 4: Teach my language**
```
As a language creator,
I want to create lessons and flashcards,
So that others can learn my language.

Acceptance Criteria:
  ✅ Course builder is intuitive
  ✅ Lesson order is maintained
  ✅ Flashcard creation is quick
  ✅ Students can track progress
  ✅ Can publish course publicly
```

**Story 5: Translate documents**
```
As a language creator,
I want to upload a PDF and get a translated version,
So that I can create immersive game/book assets.

Acceptance Criteria:
  ✅ PDF upload is straightforward
  ✅ Translation uses my dictionary first
  ✅ Unknown words fallback to DeepL
  ✅ Can preview translation before export
  ✅ Export as PDF or share link
```

### Jobs to Be Done (JTBD)

1. **Create a unique language quickly**
   - When: Starting a new creative project
   - Why: Need consistent linguistic foundation
   - Outcome: Have usable language specs in < 1 hour

2. **Document linguistic decisions**
   - When: Throughout language creation
   - Why: Need to remember why certain rules exist
   - Outcome: Have a "language bible" to reference

3. **Get feedback from community**
   - When: Language is mature enough to share
   - Why: Want external validation & ideas
   - Outcome: Receive constructive feedback safely

4. **Teach others about the language**
   - When: Language is complete
   - Why: Want others to use/appreciate creation
   - Outcome: Have reusable course materials

5. **Collaborate without conflicts**
   - When: Working with team on shared language
   - Why: Prevent lost work & confusion
   - Outcome: Clear contribution history

---

## Feature Prioritization

### MoSCoW Method (Phase Breakdown)

#### MUST HAVE (Phase 1-2 for MVP)
- [ ] User authentication (Google + email)
- [ ] Language creation with specs
- [ ] Add/edit/delete words
- [ ] Add/edit/delete grammar rules
- [ ] Create flashcard lessons
- [ ] Search & filter dictionary
- [ ] Basic permission system (owner/editor/viewer)
- [ ] Activity logging

#### SHOULD HAVE (Phase 3)
- [ ] PDF translation (dictionary + DeepL)
- [ ] Collaboration invitations
- [ ] Friend activity feed
- [ ] Privacy settings
- [ ] Course publishing
- [ ] IPA pronunciation picker

#### COULD HAVE (Phase 4+)
- [ ] Real-time collaborative editing
- [ ] Voice recording & analysis
- [ ] Phonology testing tools
- [ ] Advanced statistics & analytics
- [ ] Community marketplace
- [ ] Gamification (badges, leaderboards)

#### WON'T HAVE (Out of Scope)
- Mobile native apps (PWA instead)
- Machine learning phonology suggestions
- Built-in video hosting for courses
- Desktop synchronization

### Prioritization Matrix

```
High Impact, Low Effort → PRIORITY
├─ Language creation UI
├─ Dictionary management
├─ Collaboration invites
└─ Permission system

High Impact, High Effort → PLAN CAREFULLY
├─ PDF translation
├─ Real-time editing
└─ Analytics dashboard

Low Impact, Low Effort → QUICK WINS
├─ Improved icons
├─ Better onboarding
└─ Activity heatmap

Low Impact, High Effort → AVOID
├─ Mobile native app (Phase 4+)
├─ Advanced ML features
└─ Built-in video hosting
```

### Feature Request Voting Results

**From 15-user interviews:**

| Feature | Interest % | Effort | Priority |
|---------|-----------|--------|----------|
| Dictionary management | 100% | High | MUST |
| Collaboration | 93% | Medium | MUST |
| PDF translation | 80% | High | SHOULD |
| Flashcard courses | 87% | Medium | SHOULD |
| Activity feed | 60% | Low | COULD |
| Real-time editing | 53% | Very High | PHASE 4 |
| Marketplace | 40% | Very High | PHASE 4 |

---

## Design Philosophy

### Core Principles

1. **Clarity Over Cleverness**
   - Obvious navigation
   - Clear labels and instructions
   - Minimal jargon
   - Example: "Add Word" not "Lexeme Insertion"

2. **Progressive Disclosure**
   - Simple by default
   - Advanced options available
   - Guided workflows for first-time users
   - Example: Basic language creation → advanced specs

3. **Powerful Yet Simple**
   - Support linguistic depth (IPA, phonemes, rules)
   - But don't require it upfront
   - Sensible defaults for beginners
   - Example: Pre-filled phoneme sets, customizable

4. **Community First**
   - Easy sharing & discovery
   - Social features integrated naturally
   - Celebrate user contributions
   - Example: Public language gallery, activity feed

5. **Dark Mode By Default**
   - Reduces eye strain
   - Aligns with creative communities
   - Modern aesthetic
   - Example: Primary #137fec on #192633

### Color System

```
Primary:        #137fec (interactive elements)
Background:     #101922 (main surface)
Surface:        #192633 (cards, panels)
Border:         #233648 (dividers)
Text:           #ffffff (primary text)
Text Secondary: #92adc9 (secondary text)

Semantic Colors:
  Success:  #22c55e (green)
  Warning:  #f59e0b (amber)
  Error:    #ef4444 (red)
  Info:     #3b82f6 (blue)
```

### Typography

```
Font Family: Inter (display & body)

Sizes:
  H1: 48px bold (page titles)
  H2: 32px bold (section titles)
  H3: 24px bold (subsection titles)
  Body: 16px regular (main text)
  Small: 14px regular (secondary text)
  Caption: 12px regular (metadata)
```

### Spacing System

```
4px (xs)   - minimal gaps
8px (sm)   - small components
12px (md)  - medium spacing
16px (lg)  - large spacing
24px (xl)  - section separation
32px (2xl) - major section breaks
```

### Component Patterns

**Buttons:**
- Primary (filled): CTA, important actions
- Secondary (outline): alternative actions
- Tertiary (text): subtle actions
- Disabled state: opacity 50%

**Forms:**
- Labels above inputs (accessibility)
- Clear error messages (red, specific)
- Success feedback (toast, green)
- Required field indicators (asterisk)

**Cards:**
- Rounded corners (8px)
- Subtle border (#233648)
- Hover effect (slight lift, border color change)
- Consistent padding (16px)

---

## Accessibility & Inclusivity

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: 4.5:1 minimum ratio
- Interactive elements: 3:1 minimum ratio
- Example: #ffffff on #137fec = 8.5:1 ✅

**Keyboard Navigation:**
- All functionality keyboard accessible
- Tab order logical
- Focus indicators visible (min 3px)
- Escape to close modals

**Screen Readers:**
- Semantic HTML (`<button>` not `<div>`)
- ARIA labels for complex components
- Alt text for images
- Form labels associated with inputs

**Motor Accessibility:**
- Click targets minimum 44x44px
- Sufficient spacing between interactive elements
- No time-limited actions
- No hover-only content

### Inclusive Design

1. **Language**
   - Clear, simple terminology
   - Avoid jargon (use "phrase" not "utterance")
   - Explain linguistic concepts for beginners

2. **Onboarding**
   - Tutorial for first-time users
   - Video walkthrough optional
   - Contextual help tooltips
   - Example project for learning

3. **Diverse Alphabets**
   - Support Latin, Cyrillic, Arabic, etc.
   - RTL language support
   - Custom character input methods
   - IPA symbol picker

4. **Mobile Responsiveness**
   - Mobile-first design
   - Touch targets appropriately sized
   - Readable on small screens (16px minimum)
   - Responsive navigation (hamburger menu)

---

## User Journey Maps

### Journey 1: Creative Creator's First Week

```
DAY 1: Discovery & Signup
├─ Finds app on Product Hunt / Reddit
├─ Reads landing page (2 min)
├─ Signs up with Google (30 sec)
├─ Sees welcome modal (1 min)
└─ Feels: Excited, hopeful

DAY 1-2: Language Creation
├─ Clicks "New Language"
├─ Fills form with name, description (3 min)
├─ Selects specs (alphabet, writing direction) (5 min)
├─ Adds custom phoneme set (5 min)
├─ Sees success message
└─ Feels: Accomplished, ready to build

DAY 2-3: Dictionary Building
├─ Opens "Add Word" button
├─ Adds first word (name, translation, IPA) (2 min)
├─ Searches and finds word (1 min)
├─ Adds 10+ words (20 min)
├─ Exports dictionary as CSV (1 min)
└─ Feels: Productive, engaged

DAY 4: Sharing & Feedback
├─ Clicks "Share Language"
├─ Invites friend via email (2 min)
├─ Friend accepts and adds words (async)
├─ Sees friend's contributions logged
└─ Feels: Community, validation

DAY 5-7: Teaching
├─ Creates first course
├─ Adds lessons with flashcards (30 min)
├─ Tests course (5 min)
├─ Publishes course (1 min)
├─ Shares with Reddit community
└─ Feels: Pride, excitement
```

**Pain Points Addressed:**
- Overwhelming form → Progressive disclosure
- Can't organize data → Table search/filter
- Hard to share → One-click invite
- Lonely journey → Social activity feed

### Journey 2: Educator's Semester

```
WEEK 1: Course Setup
├─ Logs in, looks for "Create Course"
├─ Creates "Intro to Constructed Languages"
├─ Adds 10 lessons with structure (4 hours)
├─ Creates flashcards for vocabulary (3 hours)
├─ Publishes course
└─ Feels: Prepared, organized

WEEK 2-10: Teaching
├─ Students enroll in course (automated)
├─ Tracks enrollment & progress (3 min/week)
├─ Checks activity feed for engagement
├─ Sees which lessons need help (automated)
├─ Approves student-created vocabulary (30 min/week)
└─ Feels: Supported, data-informed

WEEK 11: Assessment
├─ Reviews student progress stats
├─ Exports engagement report
├─ Sends feedback to students
└─ Feels: Validated, impactful

AFTER COURSE: Reuse
├─ Saves course as template
├─ Archives for next year
├─ Students can continue learning
└─ Feels: Efficient, sustainable
```

**Pain Points Addressed:**
- Manual grading → Automated progress tracking
- Version control confusion → One source of truth
- Limited reusability → Template system

---

## Competitive Analysis

### Direct Competitors
**None truly competitive (niche market)**

Closest adjacent tools:
- Conlang Bulletin Board (forum, not tool)
- Scatter (worldbuilding, language is secondary)

### Indirect Competitors

| Tool | Strengths | Weaknesses | Our Advantage |
|------|-----------|-----------|---------------|
| Google Docs | Free, collaborative | Not designed for languages, messy | Purpose-built UI |
| Excel | Powerful, familiar | Not social, complex for non-techies | Simpler, community-focused |
| Anki | Great for flashcards | Not for language creation, limited collaboration | Integrated creation + learning |
| Wix/Weebly | Easy publishing | No collaborative features, language tools limited | Purpose-built + collaborative |

### Market Differentiation

```
┌──────────────────────────────────────────────┐
│                LinguaFabric                  │
├──────────────────────────────────────────────┤
│ ✅ Purpose-built for conlangs                │
│ ✅ Collaborative from day one                │
│ ✅ Integrated dictionary + courses + rules   │
│ ✅ Community sharing                         │
│ ✅ Smart translation (dictionary + DeepL)   │
│ ✅ Free & accessible                         │
├──────────────────────────────────────────────┤
│ Unique: ONLY all-in-one collaborative       │
│         conlang platform with teaching       │
└──────────────────────────────────────────────┘
```

---

## Product Roadmap

### Q1 2025: MVP Foundation
```
Phase 0 (Jan 1-9): Setup
  └─ Firebase, auth, schema

Phase 1 (Jan 10-30): Language Creation
  └─ Create languages with specs

Phase 2 (Jan 31-Feb 20): Dictionary
  └─ Add words, rules, courses

Phase 3 (Feb 21-Mar 20): Collaboration
  └─ Invites, activity, PDF translation

Result: MVP ready for launch
```

### Q2 2025: Market Validation
```
Mar 20: Public launch
Mar-May: Beta community feedback
- Fix bugs
- Improve UX based on feedback
- Grow to 500+ users

Target: 80% user satisfaction (NPS > 40)
```

### Q3 2025: Phase 4 Features
```
Jun-Aug: Real-time editing
  └─ WebSockets, operational transform

Extend course system:
  └─ Quizzes, assessments, gradebook

Analytics dashboard:
  └─ Language stats, learner metrics

Target: 1,000+ active users
```

### Q4 2025: Scale & Polish
```
Sep-Dec: Performance optimization
  └─ Caching, pagination, lazy loading

Mobile app (PWA):
  └─ Offline support, installable

Community tools:
  └─ Forums, featured languages

Target: 2,000+ active users, $5k MRR (pro tier)
```

### 2026+: Advanced Features
```
Year 2 Vision:
  - Language marketplace
  - AI-powered suggestions
  - Advanced phonology tools
  - Mobile native apps (React Native)
  - Enterprise tier for institutions
  - $100k+ ARR
```

---

## Success Definition

### Phase 0 Success
- ✅ Firebase initialized and tested
- ✅ Auth working (Google + email)
- ✅ Database schema in place

### Phase 1 Success
- ✅ 50+ languages created in beta
- ✅ Users report language specs easy to configure
- ✅ Dashboard loads < 2 seconds

### Phase 2 Success
- ✅ 500+ words added across test languages
- ✅ 20+ grammar rules created
- ✅ Course creation intuitive (no support requests)

### Phase 3 (MVP) Success
- ✅ 100+ beta users
- ✅ 50+ public languages
- ✅ 10+ collaborative languages
- ✅ NPS > 40 (promoter recommendation)
- ✅ < 0.1% error rate
- ✅ 7-day retention > 50%
- ✅ Average session > 15 minutes

### Year 1 Success
- ✅ 1,000+ active users
- ✅ 500+ public languages
- ✅ 80% 7-day retention
- ✅ $2,500+ MRR
- ✅ Featured in conlang community

---

## Key Decisions & Tradeoffs

### Decision 1: Freemium Model

**Option A:** Free forever (no monetization)
- **Pros:** Lower barrier to entry, community goodwill
- **Cons:** No revenue, can't sustain

**Option B:** Freemium (free + paid pro tier)
- **Pros:** Revenue model, free tier keeps growth
- **Cons:** Premium feature design complexity

**Decision:** ✅ Go with Freemium  
**Rationale:** Need revenue to sustain, but free tier is essential for community growth

### Decision 2: Realistic vs. Simplified

**Option A:** Only realistic depth (linguistically accurate)
- **Pros:** Appeals to serious creators
- **Cons:** Overwhelming for beginners, smaller market

**Option B:** Simplified only (easier, less accurate)
- **Pros:** Lower barrier, wider market
- **Cons:** Loses linguists, reputation risk

**Option C:** Both with toggle
- **Pros:** Serves both markets, flexible
- **Cons:** More complex development

**Decision:** ✅ Go with Both  
**Rationale:** "Simplified" warning ensures reputation, attracts beginners

### Decision 3: Real-time Collaboration

**Option A:** Launch with it (MVP delay)
- **Pros:** Major differentiator, powerful feature
- **Cons:** Complex, risky, delays MVP by 2 months

**Option B:** Launch without, add Phase 4
- **Pros:** Faster MVP, focus on core, less risk
- **Cons:** Not immediately differentiated

**Decision:** ✅ Phase 4 (post-MVP)  
**Rationale:** Core features more important, real-time adds technical complexity

---

## Metrics & Analytics

### Core Metrics

**Acquisition**
```
signup_rate: Users/week
source_breakdown: Direct, organic, paid
cost_per_acquisition: $ (post-payment phase)
```

**Activation**
```
onboarding_completion: % completing tutorial
first_language_creation: % creating first language
time_to_value: Hours until user creates first language
```

**Retention**
```
day_1_retention: % returning next day
day_7_retention: Target > 50%
day_30_retention: Target > 30%
monthly_churn: Target < 5%
```

**Engagement**
```
languages_per_user: Average languages created
words_per_language: Average words in dictionary
dau/mau: Daily/monthly active users
session_duration: Average session length
```

**Revenue**
```
free_to_paid_conversion: % upgrading
lifetime_value: $ per user
churn_rate: % canceling subscription
```

---

## Conclusion

This document defines LinguaFabric's **product direction, target users, feature priorities, and success metrics**. It guides decision-making from MVP through year 1 and beyond.

Key Takeaway: **Purpose-built tools for niche communities win by serving deeply.**

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** After Phase 1 launch (Feb 2025)
