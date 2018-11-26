const {
  Before,
  Given,
  When,
  Then
} = require("cucumber");
var assert = require("assert");

Given('today is Sunday', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'true';
});

When('I ask whether it\'s Friday yet', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'true';
});

Then('I should be told {string}', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'true';
});