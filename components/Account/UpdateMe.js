import React, { Component, Fragment } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { intersperse } from '../../lib/utils/helpers'
import { errorToString } from '../../lib/utils/errors'
import { swissTime } from '../../lib/utils/format'

import withT from '../../lib/withT'
import AddressForm, { COUNTRIES, fields as addressFields } from './AddressForm'

import {
  Loader, InlineSpinner, Interaction, Label, Button, A, colors
} from '@project-r/styleguide'

import FieldSet from '../FieldSet'

const { H2, P } = Interaction

const birthdayFormat = '%d.%m.%Y'
const birthdayParse = swissTime.parse(birthdayFormat)

const DEFAULT_COUNTRY = COUNTRIES[0]

const fields = (t, acceptedStatue) => [
  {
    label: t('pledge/contact/firstName/label'),
    name: 'firstName',
    validator: (value) => (
      value.trim().length <= 0 && t('pledge/contact/firstName/error/empty')
    )
  },
  {
    label: t('pledge/contact/lastName/label'),
    name: 'lastName',
    validator: (value) => (
      value.trim().length <= 0 && t('pledge/contact/lastName/error/empty')
    )
  },
  {
    label: t('Account/Update/phone/label'),
    name: 'phoneNumber'
  },
  {
    label: t('Account/Update/birthday/label/optional'),
    name: 'birthday',
    mask: '11.11.1111',
    maskChar: '_',
    validator: (value) => {
      const parsedDate = birthdayParse(value)
      return (
        (
          (
            !!value.trim().length &&
            (
              parsedDate === null ||
              parsedDate > (new Date()) ||
              parsedDate < (new Date(1798, 3, 12))
            ) &&
            t('Account/Update/birthday/error/invalid')
          )
        )
      )
    }
  }
]

const getValues = (me) => {
  let addressState = {}
  if (me.address) {
    addressState = {
      name: me.address.name || me.name,
      line1: me.address.line1,
      line2: me.address.line2,
      postalCode: me.address.postalCode,
      city: me.address.city,
      country: me.address.country
    }
  } else if (me) {
    addressState.name = [
      me.firstName,
      me.lastName
    ].filter(Boolean).join(' ')
  }

  return {
    firstName: me.firstName || '',
    lastName: me.lastName || '',
    phoneNumber: me.phoneNumber || '',
    birthday: me.birthday || '',
    ...addressState
  }
}

const isEmptyAddress = (values, me) => {
  const addressString = [
    values.name,
    values.line1,
    values.line2,
    values.postalCode,
    values.city,
    values.country
  ].join('').trim()
  const emptyAddressString = [
    me.name,
    DEFAULT_COUNTRY
  ].join('').trim()

  return addressString === emptyAddressString
}

class UpdateMe extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false,
      showErrors: false,
      values: {
        country: DEFAULT_COUNTRY
      },
      errors: {},
      dirty: {}
    }
  }
  startEditing () {
    const { me } = this.props
    this.setState((state) => ({
      isEditing: true,
      values: {
        ...state.values,
        ...getValues(me)
      }
    }))
  }
  stopEditing () {
    this.setState({
      isEditing: false
    })
  }
  autoEdit () {
    if (this.props.me && !this.checked) {
      this.checked = true
      const { t, acceptedStatue, hasMemberships, me } = this.props

      const errors = FieldSet.utils.getErrors(
        fields(t, acceptedStatue).concat(
          hasMemberships || me.address
            ? addressFields(t)
            : []
        ),
        getValues(this.props.me)
      )

      const errorMessages = Object.keys(errors)
        .map(key => errors[key])
        .filter(Boolean)
      errorMessages.length && this.startEditing()
    }
  }
  componentDidMount () {
    this.autoEdit()
  }
  componentDidUpdate () {
    this.autoEdit()
  }
  render () {
    const {
      t, me,
      loading,
      error,
      style,
      acceptedStatue,
      hasMemberships
    } = this.props
    const {
      values, dirty, errors,
      updating, isEditing
    } = this.state

    return (
      <Loader loading={loading || !me} error={error} render={() => {
        const meFields = fields(t, acceptedStatue)
        let errorFilter = () => true
        if (!hasMemberships && !me.address && isEmptyAddress(values, me)) {
          errorFilter = key => meFields.find(field => field.name === key)
        }

        const errorMessages = Object.keys(errors)
          .filter(errorFilter)
          .map(key => errors[key])
          .filter(Boolean)

        return (
          <div style={style}>
            {!isEditing ? (
              <div>
                <H2 style={{ marginBottom: 30 }}>{t('Account/Update/title')}</H2>
                <P>
                  {intersperse(
                    [
                      me.name,
                      me.phoneNumber
                    ].filter(Boolean),
                    (_, i) => <br key={i} />
                  )}
                </P>
                {!!me.birthday && <P>
                  <Label key='birthday'>{t('Account/Update/birthday/label')}</Label><br />
                  {me.birthday}
                </P>}
                {!!me.address && <Fragment>
                  <P>
                    <Label>{t('Account/Update/address/label')}</Label><br />
                  </P>
                  <P>
                    {intersperse(
                      [
                        me.address.name,
                        me.address.line1,
                        me.address.line2,
                        `${me.address.postalCode} ${me.address.city}`,
                        me.address.country
                      ].filter(Boolean),
                      (_, i) => <br key={i} />
                    )}
                  </P>
                </Fragment>}
                <br />
                <A href='#' onClick={(e) => {
                  e.preventDefault()
                  this.startEditing()
                }}>{t('Account/Update/edit')}</A>
              </div>
            ) : (
              <div>
                <H2>{t('Account/Update/title')}</H2>
                <br />
                <FieldSet
                  values={values}
                  errors={errors}
                  dirty={dirty}
                  onChange={(fields) => {
                    this.setState(FieldSet.utils.mergeFields(fields))
                  }}
                  fields={meFields} />
                <Label style={{ marginTop: -8, display: 'block' }}>
                  {t('Account/Update/birthday/hint/plain')}
                </Label>
                <br /><br />
                <br />
                <AddressForm
                  values={values}
                  errors={errors}
                  dirty={dirty}
                  onChange={(fields) => {
                    this.setState(FieldSet.utils.mergeFields(fields))
                  }} />
                <br />
                <br />
                <br />
                {updating ? (
                  <div style={{ textAlign: 'center' }}>
                    <InlineSpinner />
                    <br />
                    {t('Account/Update/updating')}
                  </div>
                ) : (
                  <div>
                    {!!this.state.showErrors && errorMessages.length > 0 && (
                      <div style={{ color: colors.error, marginBottom: 40 }}>
                        {t('pledge/submit/error/title')}<br />
                        <ul>
                          {errorMessages.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!!this.state.error && (
                      <div style={{ color: colors.error, marginBottom: 40 }}>
                        {this.state.error}
                      </div>
                    )}
                    <div style={{ opacity: errorMessages.length ? 0.5 : 1 }}>
                      <Button onClick={() => {
                        if (errorMessages.length) {
                          this.setState((state) => Object.keys(state.errors).reduce(
                            (nextState, key) => {
                              nextState.dirty[key] = true
                              return nextState
                            },
                            {
                              showErrors: true,
                              dirty: {}
                            }
                          ))
                          return
                        }
                        this.setState(() => ({ updating: true }))

                        this.props.update({
                          firstName: values.firstName,
                          lastName: values.lastName,
                          phoneNumber: values.phoneNumber,
                          birthday: values.birthday && values.birthday.length
                            ? values.birthday.trim()
                            : null,
                          address: isEmptyAddress(values, me)
                            ? undefined
                            : {
                              name: values.name,
                              line1: values.line1,
                              line2: values.line2,
                              postalCode: values.postalCode,
                              city: values.city,
                              country: values.country
                            }
                        }).then(() => {
                          this.setState(() => ({
                            updating: false,
                            isEditing: false
                          }))
                        }).catch((error) => {
                          this.setState(() => ({
                            updating: false,
                            error: errorToString(error)
                          }))
                        })
                      }}>{t('Account/Update/submit')}</Button>
                      <div style={{ marginTop: 10 }}>
                        <A href='#' onClick={(e) => {
                          e.preventDefault()
                          this.stopEditing()
                        }}>
                          {t('Account/Update/cancel')}
                        </A>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }} />
    )
  }
}

const mutation = gql`mutation updateMe($birthday: Date, $firstName: String!, $lastName: String!, $phoneNumber: String, $address: AddressInput) {
  updateMe(birthday: $birthday, firstName: $firstName, lastName: $lastName, phoneNumber: $phoneNumber, address: $address) {
    id
  }
}`
export const query = gql`
  query myAddress {
    me {
      id
      name
      firstName
      lastName
      phoneNumber
      email
      birthday
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
    }
  }
`

export default compose(
  graphql(mutation, {
    props: ({ mutate }) => ({
      update: variables => mutate({
        variables,
        refetchQueries: [{
          query
        }]
      })
    })
  }),
  graphql(query, {
    props: ({ data }) => ({
      loading: data.loading,
      error: data.error,
      me: data.loading ? undefined : data.me
    })
  }),
  withT
)(UpdateMe)
