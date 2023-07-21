import { ClientEvents } from "discord.js";
import { Bient } from "../Bient";

export function Command(name: string) {
  return (constructor: Function, context: ClassDecoratorContext) => {};
}
