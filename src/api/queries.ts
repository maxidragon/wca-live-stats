export const QUERY_COMPETITIONS = `
  query Competitions($from: Date!) {
    competitions(from: $from) {
      id
      name
      startDate
      endDate
      startTime
      endTime
      venues {
        id
        country { iso2 __typename }
        __typename
      }
      __typename
    }
    recentRecords {
      ...records
      __typename
    }
  }
  fragment records on Record {
    id
    tag
    type
    attemptResult
    result {
      id
      person {
        id
        name
        country { iso2 name __typename }
        __typename
      }
      round {
        id
        competitionEvent {
          id
          event { id name __typename }
          competition { id __typename }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
`;

export const QUERY_COMPETITION = `
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      wcaId
      name
      competitionRecords {
        ...records
        __typename
      }
      competitionEvents {
        id
        event { id name __typename }
        rounds {
          id
          name
          active
          open
          number
          __typename
        }
        __typename
      }
      venues {
        id
        name
        country { iso2 name __typename }
        rooms {
          id
          name
          color
          activities {
            id
            activityCode
            name
            startTime
            endTime
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
  fragment records on Record {
    id
    tag
    type
    attemptResult
    result {
      id
      person {
        id
        name
        country { iso2 name __typename }
        __typename
      }
      round {
        id
        competitionEvent {
          id
          event { id name __typename }
          competition { id __typename }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
`;

export const QUERY_ROUND = `
  query Round($id: ID!) {
    round(id: $id) {
      id
      name
      finished
      active
      competitionEvent {
        id
        event { id name }
      }
      format { id numberOfAttempts sortBy }
      advancementCondition { level type }
      results {
        id
        ...roundResult
      }
    }
  }
  fragment roundResult on Result {
    ranking
    advancing
    advancingQuestionable
    attempts { result }
    best
    average
    person {
      id
      name
      country { iso2 name }
    }
    singleRecordTag
    averageRecordTag
    enteredAt
    enteredBy { name }
  }
`;


