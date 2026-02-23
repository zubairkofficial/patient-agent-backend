import { Annotation } from '@langchain/langgraph';
import {
  type BaseMessage,
  type AIMessage,
  type HumanMessage,
} from '@langchain/core/messages';

export const GlobalState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      if (Array.isArray(right)) {
        return left.concat(right);
      }
      return left.concat([right]);
    },
    default: () => [],
  }),

  final_score: Annotation<number>({
    reducer: (left: number, right: number) => right,
    default: () => 0,
  }),

  final_response: Annotation<string>({
    reducer: (left: string, right: string) => right,
    default: () => '',
  }),

  user_id: Annotation<number>(),
  gradingChatId: Annotation<number>(),
  patientProfileId: Annotation<number>(),
  patient_profile: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
  last_metadata: Annotation<Record<string, any>>({
    reducer: (left: Record<string, any>, right: Record<string, any>) => right,
    default: () => ({}),
  }),
  user_message: Annotation<HumanMessage>(),

  // Parallel node responses (overwrite reducer saves final output)
  risk_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right, // Overwrite with final result
    default: () => null,
  }),
  mental_status_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
  interaction_style_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
  disclosure_policy_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
  symptoms_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
  primary_diagnosis_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
  red_flags_analysis: Annotation<any>({
    reducer: (left: any, right: any) => right,
    default: () => null,
  }),
});
