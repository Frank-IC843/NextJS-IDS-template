export type DashboardTone = 'positive' | 'brand' | 'neutral' | 'caution';

export interface DashboardDefinition {
  title: string;
  subtitle: string;
  statusLabel: string;
  views: DashboardView[];
}

export interface DashboardView {
  id: string;
  label: string;
  summary: string;
  blocks: DashboardBlock[];
}

export type DashboardBlock =
  | DashboardHeroBlock
  | DashboardKpiRowBlock
  | DashboardInsightGridBlock
  | DashboardActivitySplitBlock;

export interface DashboardHeroBlock {
  type: 'hero';
  eyebrow: string;
  title: string;
  description: string;
  summaryBadges: string[];
  promptTitle: string;
  promptPreview: string;
  promptHint: string;
  suggestions: string[];
}

export interface DashboardKpiRowBlock {
  type: 'kpiRow';
  items: DashboardKpi[];
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  detail: string;
  tone: DashboardTone;
}

export interface DashboardInsightGridBlock {
  type: 'insightGrid';
  title: string;
  description: string;
  cards: DashboardInsightCard[];
}

export type DashboardInsightCard = DashboardTrendCard | DashboardDistributionCard | DashboardInsightListCard;

export interface DashboardTrendCard {
  kind: 'trend';
  id: string;
  size: 'feature';
  eyebrow: string;
  title: string;
  description: string;
  footer: string;
  points: DashboardTrendPoint[];
}

export interface DashboardTrendPoint {
  label: string;
  value: number;
}

export interface DashboardDistributionCard {
  kind: 'distribution';
  id: string;
  size: 'default';
  eyebrow: string;
  title: string;
  description: string;
  footer: string;
  segments: DashboardDistributionSegment[];
}

export interface DashboardDistributionSegment {
  label: string;
  value: number;
  tone: DashboardTone;
}

export interface DashboardInsightListCard {
  kind: 'bullets';
  id: string;
  size: 'default';
  eyebrow: string;
  title: string;
  description: string;
  footer: string;
  items: string[];
  tone: DashboardTone;
}

export interface DashboardActivitySplitBlock {
  type: 'activitySplit';
  ordersTitle: string;
  ordersDescription: string;
  orders: DashboardOrder[];
  sidePanelTitle: string;
  sidePanelDescription: string;
  recommendations: DashboardRecommendation[];
}

export interface DashboardOrder {
  id: string;
  store: string;
  owner: string;
  placedAt: string;
  amount: string;
  summary: string;
  status: string;
  statusTone: DashboardTone;
}

export interface DashboardRecommendation {
  id: string;
  title: string;
  body: string;
  meta: string;
  tone: DashboardTone;
}

export const mockDashboardData: DashboardDefinition = {
  title: 'Dashboard',
  subtitle: 'A mock Instacart Business dashboard designed as the first step toward natural-language generated reporting.',
  statusLabel: 'Mock dataset',
  views: [
    {
      id: 'last8Weeks',
      label: 'Last 8 weeks',
      summary: 'Orders, spend, and operational signals for the last two months.',
      blocks: [
        {
          type: 'hero',
          eyebrow: 'Dashboard studio',
          title: 'See your orders and the signals behind them.',
          description:
            'This first mock turns the business dashboard into a richer story: a hero, sharper KPIs, a stronger insight mosaic, and room for AI-driven prompts later.',
          summaryBadges: ['128 orders', '$18.4K spend', '97.2% fill rate', '3 notable shifts'],
          promptTitle: 'Future AI dashboard prompt',
          promptPreview: 'I want to see my orders and insights on orders for the last two months.',
          promptHint: 'Next milestone: replace this canned prompt preview with real prompt-to-widget generation.',
          suggestions: ['Compare weekday vs weekend baskets', 'Show top departments by spend', 'Highlight budget drift'],
        },
        {
          type: 'kpiRow',
          items: [
            {
              id: 'ordersPlaced',
              label: 'Orders placed',
              value: '128',
              change: '+14 vs prior period',
              detail: 'Steady demand across produce, dairy, and pantry restocks.',
              tone: 'positive',
            },
            {
              id: 'totalSpend',
              label: 'Total spend',
              value: '$18,420',
              change: '6.1% under budget',
              detail: 'Spend remained controlled while basket size climbed.',
              tone: 'brand',
            },
            {
              id: 'averageBasket',
              label: 'Average basket',
              value: '$143.90',
              change: '+8.4% basket growth',
              detail: 'Midweek replenishment runs are getting bigger.',
              tone: 'positive',
            },
            {
              id: 'fillRate',
              label: 'On-time fill rate',
              value: '97.2%',
              change: '+1.3 pts above target',
              detail: 'Morning orders continue to perform best.',
              tone: 'positive',
            },
          ],
        },
        {
          type: 'insightGrid',
          title: 'What stands out',
          description: 'A more visual view of momentum, spend mix, and the shifts worth sharing with your team.',
          cards: [
            {
              kind: 'trend',
              id: 'weeklyOrderRhythm',
              size: 'feature',
              eyebrow: 'Order rhythm',
              title: 'Midweek replenishment is carrying more volume than expected.',
              description:
                'Tuesday through Thursday now drive 43% of recent order volume, led by produce-heavy baskets and catering prep.',
              footer: 'Peak volume lined up with beverage demand and a regional events push.',
              points: [
                { label: 'W1', value: 44 },
                { label: 'W2', value: 55 },
                { label: 'W3', value: 58 },
                { label: 'W4', value: 64 },
                { label: 'W5', value: 62 },
                { label: 'W6', value: 73 },
                { label: 'W7', value: 78 },
                { label: 'W8', value: 82 },
              ],
            },
            {
              kind: 'distribution',
              id: 'categoryMix',
              size: 'default',
              eyebrow: 'Spend mix',
              title: 'Produce and beverages explain most of the lift.',
              description: 'Fresh categories are driving growth while pantry staples stay relatively steady.',
              footer: '71% of spend growth came from produce, beverages, and prepared foods.',
              segments: [
                { label: 'Produce', value: 34, tone: 'positive' },
                { label: 'Beverages', value: 21, tone: 'brand' },
                { label: 'Prepared foods', value: 16, tone: 'positive' },
                { label: 'Dairy', value: 15, tone: 'neutral' },
                { label: 'Pantry', value: 14, tone: 'neutral' },
              ],
            },
            {
              kind: 'bullets',
              id: 'signalsToShare',
              size: 'default',
              eyebrow: 'Signals to share',
              title: 'A few shifts deserve follow-up with the team.',
              description: 'This is the kind of concise summary a generated dashboard should eventually produce on demand.',
              footer: 'Ideal candidates for future AI callouts and recommended widgets.',
              tone: 'caution',
              items: [
                'Morning orders have the best fill rate at 98.4%, outperforming late-afternoon orders by 2.1 points.',
                'Weekend baskets jump 18% when beverage restocks are paired with fresh produce.',
                'The top 12 stores now represent 62% of total spend, showing stronger concentration.',
              ],
            },
          ],
        },
        {
          type: 'activitySplit',
          ordersTitle: 'Recent orders',
          ordersDescription: 'A fast-scanning activity list with enough detail for operators and managers.',
          orders: [
            {
              id: 'order-1004',
              store: 'West 7th St',
              owner: 'Prepared foods team',
              placedAt: 'Today, 8:20 AM',
              amount: '$428.16',
              summary: '46 items across produce and grab-and-go beverages',
              status: 'Delivered',
              statusTone: 'positive',
            },
            {
              id: 'order-1003',
              store: 'Downtown North',
              owner: 'Cafe operations',
              placedAt: 'Yesterday, 4:15 PM',
              amount: '$286.42',
              summary: 'Bakery restock with dairy and breakfast essentials',
              status: 'Scheduled',
              statusTone: 'brand',
            },
            {
              id: 'order-1002',
              store: 'Riverside',
              owner: 'Office snacks',
              placedAt: 'Yesterday, 11:05 AM',
              amount: '$192.74',
              summary: 'Pantry refill focused on beverages and healthy snacks',
              status: 'In progress',
              statusTone: 'neutral',
            },
            {
              id: 'order-1001',
              store: 'Union Square',
              owner: 'Events team',
              placedAt: 'Mon, 9:40 AM',
              amount: '$612.08',
              summary: 'Event prep order with produce trays and beverages',
              status: 'Needs review',
              statusTone: 'caution',
            },
          ],
          sidePanelTitle: 'Suggested next moves',
          sidePanelDescription: 'Recommendations feel actionable and lightweight instead of reading like a static report.',
          recommendations: [
            {
              id: 'rec-1',
              title: 'Bundle produce and beverage replenishment',
              body: 'The strongest basket growth happens when those categories are ordered together midweek.',
              meta: 'Potential savings: 4% on delivery touches',
              tone: 'positive',
            },
            {
              id: 'rec-2',
              title: 'Review late-afternoon fulfillment',
              body: 'Fill rate dips after 3 PM. A later AI version can surface the affected stores automatically.',
              meta: 'Operational watch item',
              tone: 'caution',
            },
            {
              id: 'rec-3',
              title: 'Turn this view into a shareable brief',
              body: 'The mock layout already behaves like a generated dashboard that could be tailored for finance or ops.',
              meta: 'Future-ready dashboard pattern',
              tone: 'brand',
            },
          ],
        },
      ],
    },
    {
      id: 'last14Days',
      label: 'Last 14 days',
      summary: 'A tighter operational view for recent ordering behavior.',
      blocks: [
        {
          type: 'hero',
          eyebrow: 'Short-range view',
          title: 'Track the last two weeks without losing the bigger story.',
          description:
            'This compact view shows the same dashboard language working for shorter operational windows and follow-up questions.',
          summaryBadges: ['39 orders', '$5.9K spend', '2 review items', '1 delivery dip'],
          promptTitle: 'Future AI dashboard prompt',
          promptPreview: 'Show me the last two weeks of orders with anything that needs attention.',
          promptHint: 'The same schema can later map directly to prompt-specific widgets.',
          suggestions: ['Surface urgent issues only', 'Focus on delivery timing', 'Show top stores this week'],
        },
        {
          type: 'kpiRow',
          items: [
            {
              id: 'recentOrders',
              label: 'Orders placed',
              value: '39',
              change: '+5 vs prior 14 days',
              detail: 'Most of the lift came from Tuesday and Friday replenishment.',
              tone: 'positive',
            },
            {
              id: 'recentSpend',
              label: 'Total spend',
              value: '$5,940',
              change: '+3.2% higher',
              detail: 'Spend rose modestly while basket size stayed stable.',
              tone: 'brand',
            },
            {
              id: 'recentBasket',
              label: 'Average basket',
              value: '$152.30',
              change: '+1.1% week over week',
              detail: 'Large prep orders offset a few smaller pantry refills.',
              tone: 'neutral',
            },
            {
              id: 'recentAlerts',
              label: 'Orders needing review',
              value: '2',
              change: '1 new today',
              detail: 'One high-value event order is waiting for approval.',
              tone: 'caution',
            },
          ],
        },
        {
          type: 'insightGrid',
          title: 'Recent movement',
          description: 'Useful when the team wants to understand what changed this week, not just long-term trends.',
          cards: [
            {
              kind: 'trend',
              id: 'twoWeekVolume',
              size: 'feature',
              eyebrow: 'Daily pace',
              title: 'Order pacing accelerated after the weekend reset.',
              description: 'The most recent week began slower, then recovered with stronger weekday replenishment.',
              footer: 'A generated dashboard could swap this for hourly demand or delayed-delivery analysis.',
              points: [
                { label: 'D1', value: 38 },
                { label: 'D2', value: 33 },
                { label: 'D3', value: 41 },
                { label: 'D4', value: 54 },
                { label: 'D5', value: 63 },
                { label: 'D6', value: 58 },
                { label: 'D7', value: 61 },
                { label: 'D8', value: 68 },
              ],
            },
            {
              kind: 'distribution',
              id: 'recentDepartmentMix',
              size: 'default',
              eyebrow: 'Department mix',
              title: 'Prepared foods stayed elevated.',
              description: 'Short-term demand skewed toward convenience and event-ready categories.',
              footer: 'Prepared foods and beverages combined for 37% of recent spend.',
              segments: [
                { label: 'Prepared foods', value: 19, tone: 'brand' },
                { label: 'Produce', value: 26, tone: 'positive' },
                { label: 'Beverages', value: 18, tone: 'positive' },
                { label: 'Pantry', value: 20, tone: 'neutral' },
                { label: 'Other', value: 17, tone: 'neutral' },
              ],
            },
            {
              kind: 'bullets',
              id: 'recentTakeaways',
              size: 'default',
              eyebrow: 'Quick takeaways',
              title: 'The tighter window exposes immediate next steps.',
              description: 'Operators can scan this card before jumping into detailed order history.',
              footer: 'Designed to become a generated executive summary later.',
              tone: 'brand',
              items: [
                'The largest baskets came from catering prep and office restocks placed before noon.',
                'One delivery dip affected a high-value order and is visible in the recent activity panel.',
                'Produce volume held steady even as pantry demand softened slightly.',
              ],
            },
          ],
        },
        {
          type: 'activitySplit',
          ordersTitle: 'Recent activity',
          ordersDescription: 'The near-term view favors fast operational scanning over a long-form report.',
          orders: [
            {
              id: 'order-2004',
              store: 'West 7th St',
              owner: 'Cafe operations',
              placedAt: 'Today, 9:10 AM',
              amount: '$214.00',
              summary: 'Breakfast restock with dairy, fruit, and bakery staples',
              status: 'Delivered',
              statusTone: 'positive',
            },
            {
              id: 'order-2003',
              store: 'South Market',
              owner: 'Events team',
              placedAt: 'Today, 7:45 AM',
              amount: '$488.20',
              summary: 'Event order requiring approval on specialty beverages',
              status: 'Needs review',
              statusTone: 'caution',
            },
            {
              id: 'order-2002',
              store: 'Downtown North',
              owner: 'Office snacks',
              placedAt: 'Yesterday, 3:30 PM',
              amount: '$173.94',
              summary: 'Snack refill with strong beverage overlap',
              status: 'Scheduled',
              statusTone: 'brand',
            },
          ],
          sidePanelTitle: 'Operator prompts to try next',
          sidePanelDescription: 'A future LLM response can populate this panel with follow-up prompts based on the current view.',
          recommendations: [
            {
              id: 'rec-4',
              title: 'Ask for delayed delivery root causes',
              body: 'The visual system already reserves space for generated explanations and remediation ideas.',
              meta: 'Natural-language follow-up',
              tone: 'brand',
            },
            {
              id: 'rec-5',
              title: 'Highlight top-value orders automatically',
              body: 'Large baskets are infrequent enough to deserve a dedicated generated widget.',
              meta: 'Candidate widget',
              tone: 'positive',
            },
          ],
        },
      ],
    },
    {
      id: 'quarterToDate',
      label: 'Quarter to date',
      summary: 'A broader planning view for leadership and finance conversations.',
      blocks: [
        {
          type: 'hero',
          eyebrow: 'Leadership view',
          title: 'Use the same dashboard language for planning-level questions.',
          description:
            'Quarter-to-date shows how the same component system can support a more strategic story without changing the route structure.',
          summaryBadges: ['412 orders', '$57.8K spend', '8.2% QoQ growth', 'Budget on track'],
          promptTitle: 'Future AI dashboard prompt',
          promptPreview: 'Show quarter-to-date spend, trends by department, and recommendations for next month.',
          promptHint: 'The renderer is intentionally schema-friendly so a later prompt can reshape the layout without a rewrite.',
          suggestions: ['Show quarter-over-quarter change', 'Compare top locations', 'Summarize savings opportunities'],
        },
        {
          type: 'kpiRow',
          items: [
            {
              id: 'qtdOrders',
              label: 'Orders placed',
              value: '412',
              change: '+8.2% quarter over quarter',
              detail: 'Growth stayed healthy without budget spikes.',
              tone: 'positive',
            },
            {
              id: 'qtdSpend',
              label: 'Total spend',
              value: '$57,840',
              change: '2.4% below plan',
              detail: 'Savings largely came from consolidated midweek ordering.',
              tone: 'brand',
            },
            {
              id: 'qtdLocations',
              label: 'Active locations',
              value: '18',
              change: '+2 this quarter',
              detail: 'Most new activity came from smaller satellite offices.',
              tone: 'neutral',
            },
            {
              id: 'qtdReviewRate',
              label: 'Orders needing review',
              value: '11',
              change: '-3 vs last quarter',
              detail: 'Approval and delivery exceptions are trending down.',
              tone: 'positive',
            },
          ],
        },
        {
          type: 'insightGrid',
          title: 'Planning signals',
          description: 'The broader view demonstrates how the dashboard can flex from operations to leadership planning.',
          cards: [
            {
              kind: 'trend',
              id: 'quarterPacing',
              size: 'feature',
              eyebrow: 'Quarter pacing',
              title: 'Volume accelerated gradually instead of arriving in one spike.',
              description: 'That pattern suggests reliable growth and gives finance a more stable forecast base.',
              footer: 'A future prompt could swap this card for margin or delivery efficiency.',
              points: [
                { label: 'M1', value: 46 },
                { label: 'M2', value: 51 },
                { label: 'M3', value: 59 },
                { label: 'M4', value: 63 },
                { label: 'M5', value: 70 },
                { label: 'M6', value: 74 },
                { label: 'M7', value: 79 },
                { label: 'M8', value: 85 },
              ],
            },
            {
              kind: 'distribution',
              id: 'quarterMix',
              size: 'default',
              eyebrow: 'Quarter mix',
              title: 'Fresh categories remain the clearest growth lever.',
              description: 'Leadership gets the at-a-glance distribution view without needing another BI screen.',
              footer: 'Produce, dairy, and beverages collectively represent 63% of quarter spend.',
              segments: [
                { label: 'Produce', value: 31, tone: 'positive' },
                { label: 'Dairy', value: 17, tone: 'neutral' },
                { label: 'Beverages', value: 15, tone: 'brand' },
                { label: 'Prepared foods', value: 14, tone: 'positive' },
                { label: 'Pantry', value: 23, tone: 'neutral' },
              ],
            },
            {
              kind: 'bullets',
              id: 'quarterNarrative',
              size: 'default',
              eyebrow: 'Narrative summary',
              title: 'The quarter-to-date view already reads like an executive brief.',
              description: 'That is useful for the hackathon story because it shows how generated dashboards can replace static reporting.',
              footer: 'Designed for eventual prompt-to-layout generation.',
              tone: 'positive',
              items: [
                'Growth stayed consistent while spend remained below plan, which is the strongest signal on the page.',
                'New locations added volume without materially increasing exception rates.',
                'Fresh-category strength suggests a focused savings conversation on delivery consolidation.',
              ],
            },
          ],
        },
        {
          type: 'activitySplit',
          ordersTitle: 'Leadership snapshot',
          ordersDescription: 'Recent activity stays visible so strategic context never drifts too far from operational reality.',
          orders: [
            {
              id: 'order-3003',
              store: 'Union Square',
              owner: 'Regional operations',
              placedAt: 'Today, 8:00 AM',
              amount: '$740.88',
              summary: 'High-volume restock tied to a multi-location event push',
              status: 'Delivered',
              statusTone: 'positive',
            },
            {
              id: 'order-3002',
              store: 'Downtown North',
              owner: 'Finance review',
              placedAt: 'Yesterday, 2:20 PM',
              amount: '$522.31',
              summary: 'Quarter-end supply run with beverages and produce',
              status: 'Scheduled',
              statusTone: 'brand',
            },
            {
              id: 'order-3001',
              store: 'South Market',
              owner: 'Executive kitchen',
              placedAt: 'Mon, 10:15 AM',
              amount: '$306.54',
              summary: 'Weekly staples and grab-and-go replenishment',
              status: 'Delivered',
              statusTone: 'positive',
            },
          ],
          sidePanelTitle: 'Planning recommendations',
          sidePanelDescription: 'These cards frame the page like a shareable brief for finance, ops, and leadership.',
          recommendations: [
            {
              id: 'rec-6',
              title: 'Generate a finance-focused variant next',
              body: 'The renderer already supports swapping blocks, which makes role-specific dashboards easy to pitch.',
              meta: 'Leadership use case',
              tone: 'brand',
            },
            {
              id: 'rec-7',
              title: 'Track consolidation savings monthly',
              body: 'The clearest upside comes from reducing delivery touches while preserving basket growth.',
              meta: 'Savings opportunity',
              tone: 'positive',
            },
          ],
        },
      ],
    },
  ],
};
