import ParserBuilder from '../ParserBuilder'
import {
  IDENTIFIER,
  STRING_WITH_DOUBLE_QUOTE,
  STRING_WITH_SINGLE_QUOTE,
  TRUE,
  FALSE,
  NUMBER,
  DATE,
  RESOURCE
} from './constants'
import handleResources from './handleResources'

// expression = primitive, $ | arrayContent, $ | objectContent, $
function expression (evaluator) {
  const end = evaluator => evaluator.end()
  const handler = ([value]) => value

  return evaluator.option([primitive, arrayContent, objectContent].map(
    term => evaluator => evaluator.sequence([term, end], handler)
  ))
}

// primitive = string | boolean | date | number | resource | array | object
function primitive (evaluator) {
  return evaluator.option([string, boolean, date, number, resource, array, object])
}

// array = "[", arrayContent, "]"
function array (evaluator) {
  return evaluator.sequence(
    ['[', arrayContent, ']'],
    ([_, value]) => value
  )
}

// arrayContent = primitive, { ",", primitive }
function arrayContent (evaluator) {
  return evaluator.sequence(
    [
      primitive,
      evaluator => evaluator.repetition(
        evaluator => evaluator.sequence([',', primitive], ([_, value]) => value)
      )
    ],
    ([head, tail]) => [head, ...tail]
  )
}

// object = "{", objectContent, "}"
function object (evaluator) {
  return evaluator.sequence(
    ['{', objectContent, '}'],
    ([_, value]) => value
  )
}

// objectContent = tuple, { ",", tuple }
function objectContent (evaluator) {
  return evaluator.sequence(
    [tuple, evaluator => evaluator.repetition(
      evaluator => evaluator.sequence([',', tuple], ([_, value]) => value),
      tuples => tuples.reduce((acc, tuple) => ({ ...tuple, ...acc }), {})
    )],
    ([head, tail]) => ({ ...head, ...tail })
  )
}

// tuple = identifier, primitive
function tuple (evaluator) {
  return evaluator.sequence(
    [identifier, primitive],
    ([key, value]) => ({ [key]: value })
  )
}

// identifier = <<TERMINAL>>
function identifier (evaluator) {
  return evaluator.match(IDENTIFIER, key => key.substring(0, key.length - 1))
}

// string = <<TERMINAL>>
function string (evaluator) {
  return evaluator.option(
    [STRING_WITH_DOUBLE_QUOTE, STRING_WITH_SINGLE_QUOTE],
    value => value.substring(1, value.length - 1)
  )
}

// boolean = <<TERMINAL>>
function boolean (evaluator) {
  return evaluator.option([TRUE, FALSE], value => value === TRUE)
}

// number = <<TERMINAL>>
function number (evaluator) {
  return evaluator.match(NUMBER, value => parseFloat(value))
}

// date = <<TERMINAL>>
function date (evaluator) {
  return evaluator.match(DATE, value => new Date(value))
}

// resource = <<TERMINAL>>
function resource (evaluator) {
  return evaluator.match(RESOURCE, handleResources)
}

export default function parseValue (string, resources, basePath) {
  const evaluator = new ParserBuilder(string, { resources, basePath })
  const [success, value] = expression(evaluator)

  if (success) return value

  return string
}
