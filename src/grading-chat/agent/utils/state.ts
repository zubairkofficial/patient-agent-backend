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

  final_response: Annotation<string>({
    reducer: (left: string, right: string) => {
      return right;
    },
    default: () => '',
  }),

  user_id: Annotation<number>(),

  // Grading-specific identifiers
  gradingChatId: Annotation<number>(),
  patientProfileId: Annotation<number>(),

  // Loaded patient profile object
  patient_profile: Annotation<any>({
    reducer: (left: any, right: any) => {
      return right;
    },
    default: () => null,
  }),

  // Last computed score/metadata from grading
  last_score: Annotation<number>(),
  last_metadata: Annotation<Record<string, any>>({
    reducer: (left: Record<string, any>, right: Record<string, any>) => {
      return right;
    },
    default: () => ({}),
  }),
  user_message: Annotation<HumanMessage>(),
});
