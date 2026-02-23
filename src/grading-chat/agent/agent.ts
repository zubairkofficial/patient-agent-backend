import { StateGraph, START, END } from '@langchain/langgraph';
import { GlobalState } from './utils/state';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

// Node imports
import {
  loadProfileNode,
  analyzeRiskNode,
  analyzeMentalStatusNode,
  analyzeInteractionStyleNode,
  analyzeDisclosurePolicyNode,
  analyzeSymptomsNode,
  analyzePrimaryDiagnosisNode,
  analyzeRedFlagsNode,
  generatePatientResponseNode,
  gradingOnlyNode,
} from './utils/nodes';

export const chatGraph = new StateGraph(GlobalState)
  .addNode('loadProfileNode', loadProfileNode)
  .addNode('analyzeRiskNode', analyzeRiskNode)
  .addNode('analyzeMentalStatusNode', analyzeMentalStatusNode)
  .addNode('analyzeInteractionStyleNode', analyzeInteractionStyleNode)
  .addNode('analyzeDisclosurePolicyNode', analyzeDisclosurePolicyNode)
  .addNode('analyzeSymptomsNode', analyzeSymptomsNode)
  .addNode('analyzePrimaryDiagnosisNode', analyzePrimaryDiagnosisNode)
  .addNode('analyzeRedFlagsNode', analyzeRedFlagsNode)
  .addNode('generatePatientResponseNode', generatePatientResponseNode)

  // Step 1: Run loadProfileNode first
  .addEdge(START, 'loadProfileNode')

  // Step 2: After loadProfileNode, trigger all analysis nodes in parallel
  .addEdge('loadProfileNode', 'analyzeRiskNode')
  .addEdge('loadProfileNode', 'analyzeMentalStatusNode')
  .addEdge('loadProfileNode', 'analyzeInteractionStyleNode')
  .addEdge('loadProfileNode', 'analyzeDisclosurePolicyNode')
  .addEdge('loadProfileNode', 'analyzeSymptomsNode')
  .addEdge('loadProfileNode', 'analyzePrimaryDiagnosisNode')
  .addEdge('loadProfileNode', 'analyzeRedFlagsNode')

  // Step 3: After all parallel analysis nodes complete, converge to generate response
  .addEdge('analyzeRiskNode', 'generatePatientResponseNode')
  .addEdge('analyzeMentalStatusNode', 'generatePatientResponseNode')
  .addEdge('analyzeInteractionStyleNode', 'generatePatientResponseNode')
  .addEdge('analyzeDisclosurePolicyNode', 'generatePatientResponseNode')
  .addEdge('analyzeSymptomsNode', 'generatePatientResponseNode')
  .addEdge('analyzePrimaryDiagnosisNode', 'generatePatientResponseNode')
  .addEdge('analyzeRedFlagsNode', 'generatePatientResponseNode')
  .addEdge('generatePatientResponseNode', END);
export const getGraph = async () => {
  const checkpointer = PostgresSaver.fromConnString(
    `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  );
  await checkpointer.setup();

  const graph = chatGraph.compile({ checkpointer });
  return graph;
};

export const gradingGraph = new StateGraph(GlobalState)
  .addNode('loadProfileNode', loadProfileNode) // fetch patient profile
  .addNode('gradingOnlyNode', gradingOnlyNode) // analyze history & generate grade
  .addEdge(START, 'loadProfileNode')
  .addEdge('loadProfileNode', 'gradingOnlyNode')
  .addEdge('gradingOnlyNode', END);

export const getGradingGraph = async () => {
  const checkpointer = PostgresSaver.fromConnString(
    `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  );
  await checkpointer.setup();

  const graph = gradingGraph.compile({ checkpointer });
  return graph;
};
