import React, { Component } from 'react'
import questionStyles from './questionStyles'
import debounce from 'lodash.debounce'

import {
  Interaction
} from '@project-r/styleguide'
import TextInput from './TextInput/TextInput'
import withT from '../../lib/withT'
const { H2 } = Interaction

class TextQuestion extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      updating: null,
      ...this.deriveStateFromProps(props)
    }
  }

  deriveStateFromProps (props) {
    return props.question.userAnswer ? props.question.userAnswer.payload : { value: null }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.question.userAnswer !== this.props.question.userAnswer) {
      this.setState(this.deriveStateFromProps(nextProps))
    }
  }

  onChangeDebounced = debounce(this.props.onChange, 1000)

  handleChange = (ev) => {
    const { question: { userAnswer, maxLength } } = this.props
    const answerId = userAnswer ? userAnswer.id : undefined
    const value = ev.target.value
    if (value.length <= +maxLength) {
      this.setState({ value })
      this.onChangeDebounced(answerId, value)
    }
  }

  render () {
    const { question: { text, maxLength }, t } = this.props
    const { value } = this.state
    return (
      <div>
        { text &&
        <H2 {...questionStyles.label}>{text}</H2>
        }
        <TextInput
          placeholder={t('questionnaire/text/label', { maxLength })}
          text={value || ''}
          onChange={this.handleChange}
          maxLength={maxLength}
        />
      </div>
    )
  }
}

export default withT(TextQuestion)
