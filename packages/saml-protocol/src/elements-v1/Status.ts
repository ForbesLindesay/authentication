import * as t from 'funtypes';

import {PrimaryStatus, SecondaryStatus} from '../constants';
import {statusCodeXml} from './StatusCode';

export interface Status {
  primaryStatus: PrimaryStatus;
  secondaryStatus?: SecondaryStatus;
  message?: string;
  /**
   * The <StatusDetail> element MAY be used to specify additional information concerning the status of
   * the request. The additional information consists of zero or more elements from any namespace, with no
   * requirement for a schema to be present or for schema validation of the <StatusDetail> contents.
   */
  detail?: unknown;
}

const StatusSchema = t.Intersect(
  t.Object({
    primaryStatus: t.Enum(`PrimaryStatus`, PrimaryStatus),
  }),
  t.Partial({
    secondaryStatus: t.Enum(`SecondaryStatus`, SecondaryStatus),
    message: t.String,
    detail: t.Unknown,
  }),
);

export const StatusXmlSchema = t
  .Intersect(
    t.Object({
      StatusCode: t.Tuple(
        t.Object({
          '@Value': t.Enum(`PrimaryStatus`, PrimaryStatus),
          StatusCode: t.Union(
            t.Undefined,
            t.Tuple(
              t.Object({'@Value': t.Enum(`SecondaryStatus`, SecondaryStatus)}),
            ),
          ),
        }),
      ),
    }),
    t.Partial({
      StatusMessage: t.Tuple(t.String),
      StatusDetail: t.Tuple(t.Unknown),
    }),
  )
  .withParser<Status>({
    test: StatusSchema,
    parse(xml) {
      return {
        success: true,
        value: {
          primaryStatus: xml.StatusCode[0]['@Value'],
          secondaryStatus: xml.StatusCode[0].StatusCode?.[0]['@Value'],
          message: xml.StatusMessage?.[0],
          detail: xml.StatusDetail?.[0],
        },
      };
    },
    serialize({primaryStatus, secondaryStatus, message, detail}) {
      return {
        success: true,
        value: {
          StatusCode: [
            {
              '@Value': primaryStatus,
              StatusCode: secondaryStatus
                ? [{'@Value': secondaryStatus}]
                : undefined,
            },
          ],
          StatusMessage: message ? [message] : undefined,
          StatusDetail: detail ? [detail] : undefined,
        },
      };
    },
  });

/**
 * Get the XMLBuilder parameters for the Status element
 */
export function statusXml({
  primaryStatus,
  secondaryStatus,
  message,
  detail,
}: Status) {
  return {
    StatusCode: statusCodeXml({primaryStatus, secondaryStatus}),
    StatusMessage: message,
    StatusDetail: detail,
  };
}
