import { InvalidArgumentError } from "commander";

/**
 * @param dateString an ISO 8601 formatted datetime argument
 * @returns The argument coerced into a `Date` object
 * @throws {InvalidArgumentError} must be a valid ISO 8601 formatted `string`
 */
export default (dateString: string): Date => {
    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
      throw new InvalidArgumentError('Invalid datetime format');
    }

    return parsedDate;
  };