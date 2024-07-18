import { defaultTransformers } from "@lilybird/transformers";
import { Handler } from "@lilybird/handlers/advanced";

const { interactionCreate, ...simpleTransformers } = defaultTransformers;

export type SimpleTransformers = typeof simpleTransformers;
export const transformers = simpleTransformers;

export const handler = new Handler<SimpleTransformers>({});
export const $applicationCommand = handler.storeCommand.bind(handler);
export const $listener = handler.storeListener.bind(handler);
export const $component = handler.buttonCollector.bind(handler);