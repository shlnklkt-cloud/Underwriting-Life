
export enum AppView {
  LANDING = 'LANDING',
  MEDICAL_SELECTION = 'MEDICAL_SELECTION',
  CHAT = 'CHAT',
  PAYMENT = 'PAYMENT',
  POLICY = 'POLICY'
}

export interface AgentAction {
  agentName: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO' | 'PENDING';
  decision?: string;
  reasoning: string;
}

export interface UnderwritingState {
  age?: number;
  gender?: string;
  income?: string;
  amount?: number;
  term?: number;
  occupation?: string;
  smokingStatus?: string;
  diabetes?: string;
  hbA1c?: number;
  bmi?: number;
  bpHistory?: string;
  alcohol?: string;
  hobbies?: string;
  riskRating?: string;
  riskMultiplier?: number;
  annualPremium?: number;
  policyNumber?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  agentActions?: AgentAction[];
  isQuote?: boolean;
  options?: string[];
}

export interface UnderwritingResponse {
  agentActions: AgentAction[];
  nextQuestion: string;
  state: UnderwritingState;
  showQuote?: boolean;
  complete?: boolean;
  options?: string[];
}
