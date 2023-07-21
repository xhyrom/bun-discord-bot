import { ClientEvents } from "discord.js";
import { Bient } from "../Bient";

export function Listener(event: keyof ClientEvents) {
  return (constructor: Function, context: ClassMethodDecoratorContext) => {
    const name = context as unknown as string;

    Bient.instance.on.bind(Bient.instance)(event, (...args) =>
      constructor[name]([...args])
    );
  };
}
