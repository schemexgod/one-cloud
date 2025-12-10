import * as translator from './src/jsx-translator'
import * as View from "./src/View";

export * from './src/jsx-translator'
export * from "./src/View";
export const PlayWebUI = {
  ...View,
  ...translator
}
export default PlayWebUI