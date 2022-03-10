import * as t from 'funtypes';
import {SecondaryStatus, PrimaryStatus} from '../constants';

export interface StatusCode {
  primaryStatus: PrimaryStatus;
  secondaryStatus?: SecondaryStatus;
}

/**
 * Get the XMLBuilder parameters for the StatusCode element
 */
export function statusCodeXml({primaryStatus, secondaryStatus}: StatusCode) {
  return {
    '@Value': primaryStatus,
    StatusCode: secondaryStatus ? {'@Value': secondaryStatus} : undefined,
  };
}

export const StatusCodeSchema = t
  .Object({
    '@Value': t.Enum(`PrimaryStatus`, PrimaryStatus),
    StatusCode: t.Union(
      t.Undefined,
      t.Tuple(t.Object({'@Value': t.Enum(`SecondaryStatus`, SecondaryStatus)})),
    ),
  })
  .withParser<StatusCode>({
    test: t.Intersect(
      t.Object({primaryStatus: t.Enum(`PrimaryStatus`, PrimaryStatus)}),
      t.Partial({secondaryStatus: t.Enum(`SecondaryStatus`, SecondaryStatus)}),
    ),
    parse: (element) => ({
      success: true,
      value: {
        primaryStatus: element['@Value'],
        secondaryStatus: element['StatusCode']?.[0]['@Value'],
      },
    }),
    serialize({primaryStatus, secondaryStatus}) {
      return {
        success: true,
        value: {
          '@Value': primaryStatus,
          StatusCode: secondaryStatus
            ? [{'@Value': secondaryStatus}]
            : undefined,
        },
      };
    },
  });
