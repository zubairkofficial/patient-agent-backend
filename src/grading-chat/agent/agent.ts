import { StateGraph, START, END } from '@langchain/langgraph';
import { GlobalState } from './utils/state';

import {
  loadProfileNode,
  analyzeMessageNode,
  gradingResponseNode,
} from './utils/nodes';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

// Grading-specific graph
const gradingGraph = new StateGraph(GlobalState)
  .addNode('loadProfileNode', loadProfileNode)
  .addNode('analyzeMessageNode', analyzeMessageNode)
  .addNode('gradingResponseNode', gradingResponseNode)
  .addEdge(START, 'loadProfileNode')
  .addEdge('loadProfileNode', 'analyzeMessageNode')
  .addEdge('analyzeMessageNode', 'gradingResponseNode')
  .addEdge('gradingResponseNode', END);

export const getGraph = async () => {
  const checkpointer = PostgresSaver.fromConnString(
    `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  );
  await checkpointer.setup();

  const graph = gradingGraph.compile({
    checkpointer,
  });

  return graph;
};
