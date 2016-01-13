export default function(hook, next) {
  hook.result.ran = true;
  next();
}