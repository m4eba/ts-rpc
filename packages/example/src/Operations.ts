export interface Summands {
  n: number[];
}

export interface ArithmeticEvent {
  addition(summands: Summands, result: number): void;
}

export interface ArithmeticService {
  add(summands: Summands): Promise<number>;
}
