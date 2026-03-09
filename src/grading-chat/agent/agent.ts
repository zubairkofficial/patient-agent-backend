import { StateGraph, START, END } from '@langchain/langgraph';
import { GlobalState } from './utils/state';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

import {
  loadProfileNode,
  generatePatientResponseNode,
  gradingOnlyNode,
} from './utils/nodes';

export const chatGraph = new StateGraph(GlobalState)
  .addNode('loadProfileNode', loadProfileNode)
  .addNode('generatePatientResponseNode', generatePatientResponseNode)
  .addEdge(START, 'loadProfileNode')
  .addEdge('loadProfileNode', 'generatePatientResponseNode')
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
  .addNode('loadProfileNode', loadProfileNode)
  .addNode('gradingOnlyNode', gradingOnlyNode)
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
