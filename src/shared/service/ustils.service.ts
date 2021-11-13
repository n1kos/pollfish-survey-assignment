export class Utils {
  public debounce = (func: Function, wait: number) => {
    return function executedFunction(...args: []) {
      // eslint-disable-next-line prefer-const
      let timeout: ReturnType<typeof setTimeout> | null;
      const later = () => {
        timeout = null;
        func(...args);
      };
      //@ts-expect-error use-before-assign
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  public swapArrayElements = (
    a: Array<any> | undefined,
    x: number,
    y: number
  ) => {
    if (a?.length === 1) return a;
    a?.splice(y, 1, a?.splice(x, 1, a[y])[0]);
    return a;
  };
}
