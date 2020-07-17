import AlgorithmID from './AlgorithmID';
import {ParsedAlgorithmOptions} from './AlgorithmOptions';

export default interface AlgoirthmImplementation<
  TAlgorithmID extends AlgorithmID
> {
  id: TAlgorithmID;
  hash(
    password: Uint8Array,
    options: ParsedAlgorithmOptions<TAlgorithmID>,
  ): Promise<Uint8Array>;
  verify(
    password: Uint8Array,
    passwordHash: Uint8Array,
    options?: ParsedAlgorithmOptions<TAlgorithmID>,
  ): Promise<{valid: boolean; outdated: boolean}>;
}
