import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field, useFormState } from 'react-final-form';

import {
  Col,
  Label,
  Row,
  Select,
  TextField,
} from '@folio/stripes/components';
import {
  requiredValidator,
  composeValidators,
} from '@folio/stripes-erm-components';

import {
  useSerialsManagementRefdata,
  selectifyRefdata,
  validateWithinRange,
  validateWholeNumber,
} from '../../utils';
import {
  SORTED_MONTHS,
  SORTED_WEEKDAYS,
} from '../../../constants/sortedArrays';

const propTypes = {
  name: PropTypes.string,
  index: PropTypes.string,
  patternType: PropTypes.string,
};

const [MONTHS, WEEKDAYS] = ['Global.Month', 'Global.Weekday'];

const IssuePublicationField = ({ name, index, patternType }) => {
  const { values } = useFormState();
  const refdataValues = useSerialsManagementRefdata([MONTHS, WEEKDAYS]);

  const renderDayField = (
    ordinal = false,
    minValue = 1,
    maxValue = 1,
    disabled = false
  ) => {
    return (
      <Field
        component={TextField}
        disabled={disabled}
        label={<FormattedMessage id="ui-serials-management.ruleset.day" />}
        name={
          ordinal
            ? `${name}[${index}].ordinal`
            : `${name}[${index}].pattern.day`
        }
        required={!disabled}
        type="number"
        validate={
          !disabled &&
          composeValidators(
            requiredValidator,
            validateWithinRange(minValue, maxValue),
            validateWholeNumber
          )
        }
      />
    );
  };

  const renderWeekdayField = () => {
    return (
      <Field
        component={Select}
        dataOptions={[
          { value: '', label: '' },
          ...selectifyRefdata(refdataValues, WEEKDAYS, 'value').sort((a, b) => {
            return (
              SORTED_WEEKDAYS.indexOf(a.value) -
              SORTED_WEEKDAYS.indexOf(b.value)
            );
          }),
        ]}
        label={<FormattedMessage id="ui-serials-management.ruleset.day" />}
        name={`${name}[${index}].pattern.weekday.value`}
        required
        validate={requiredValidator}
      />
    );
  };

  const renderWeekField = (ordinal = false, minValue = 1, maxValue = 1) => {
    return (
      <Field
        component={TextField}
        label={
          <FormattedMessage id="ui-serials-management.ruleset.ofWeek" />
        }
        name={
          ordinal
            ? `${name}[${index}].ordinal`
            : `${name}[${index}].pattern.week`
        }
        required
        type="number"
        validate={composeValidators(
          requiredValidator,
          validateWithinRange(minValue, maxValue),
          validateWholeNumber
        )}
      />
    );
  };

  const renderMonthField = (ordinal = false, minValue = 1, maxValue = 1) => {
    return (
      <Field
        component={ordinal ? TextField : Select}
        dataOptions={[
          { value: '', label: '' },
          ...selectifyRefdata(refdataValues, MONTHS, 'value').sort((a, b) => {
            return (
              SORTED_MONTHS.indexOf(a.value) - SORTED_MONTHS.indexOf(b.value)
            );
          }),
        ]}
        label={
          <FormattedMessage id="ui-serials-management.ruleset.ofMonth" />
        }
        name={
          ordinal
            ? `${name}[${index}].ordinal`
            : `${name}[${index}].pattern.month.value`
        }
        required
        validate={
          ordinal
            ? composeValidators(
              requiredValidator,
              validateWithinRange(minValue, maxValue),
              validateWholeNumber
            )
            : requiredValidator
        }
      />
    );
  };

  const renderYearField = (ordinal = false, minValue = 1, maxValue = 1) => {
    return (
      <Field
        component={TextField}
        label={
          <FormattedMessage id="ui-serials-management.ruleset.ofYear" />
        }
        name={
          ordinal
            ? `${name}[${index}].ordinal`
            : `${name}[${index}].pattern.year`
        }
        required
        type="number"
        validate={composeValidators(
          requiredValidator,
          validateWithinRange(minValue, maxValue),
          validateWholeNumber
        )}
      />
    );
  };

  // Field render params: ordinal bool, min value of field, max value and disabled bool
  const patternTypeFormats = {
    day: {
      fields: [
        renderDayField(
          true,
          1,
          values?.recurrence?.period,
          values?.recurrence?.period <= 1 || !values?.recurrence?.period
        ),
      ],
      disabled: values?.recurrence?.period <= 1 || !values?.recurrence?.period,
    },
    week: {
      fields: [renderWeekdayField()],
      ordinal: renderWeekField(true, 1, values?.recurrence?.period),
    },
    month_date: {
      fields: [renderDayField(false, 1, 31)],
      ordinal: renderMonthField(true, 1, values?.recurrence?.period),
    },
    month_weekday: {
      fields: [renderWeekdayField(), renderWeekField(false, 1, 4)],
      ordinal: renderMonthField(true, 1, values?.recurrence?.period),
    },
    year_date: {
      fields: [renderDayField(false, 1, 31), renderMonthField()],
      ordinal: renderYearField(true, 1, values?.recurrence?.period),
    },
    year_weekday: {
      fields: [renderWeekdayField(), renderWeekField(false, 1, 52)],
      ordinal: renderYearField(true, 1, values?.recurrence?.period),
    },
    year_month_weekday: {
      fields: [
        renderWeekdayField(),
        renderWeekField(false, 1, 4),
        renderMonthField(),
      ],
      ordinal: renderYearField(true, 1, values?.recurrence?.period),
    },
  };

  return (
    <>
      {values?.patternType && (
        <Row>
          <Col xs={1}>
            <Label style={{ paddingTop: '25px' }}>
              <FormattedMessage
                id="ui-serials-management.ruleset.issueIndex"
                values={{ index: index + 1 }}
              />
            </Label>
          </Col>
          {patternTypeFormats[patternType]?.fields?.map((e) => {
            return <Col xs={2}>{e}</Col>;
          })}
          {values?.recurrence?.period > 1 &&
            !!patternTypeFormats[patternType]?.ordinal && (
              <Col xs={2}>{patternTypeFormats[patternType]?.ordinal}</Col>
          )}
        </Row>
      )}
    </>
  );
};

IssuePublicationField.propTypes = propTypes;

export default IssuePublicationField;
