/**
 * Collect EPL fixtures from the public open-matchday CSV feed.
 */
function collectEPLFixtures() {
  return collectFootballDataMatches(["EPL"], { fixturesOnly: true });
}
