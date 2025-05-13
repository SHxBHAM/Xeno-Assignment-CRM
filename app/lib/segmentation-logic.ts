import { User, Order, Address } from "@prisma/client";
import { SegmentRules, Condition } from "./segment-rules-schema"; // Ensure this path is correct
import { subDays, isBefore, isAfter, isEqual, parseISO } from "date-fns";

// Interface for derived aggregates
export interface UserAggregates {
  totalSpend: number;
  orderCount: number;
  lastOrderDate: Date | null;
}

// Type for User with included relations, inferred by Prisma but good for function signatures
export type UserWithRelations = User & {
  Order: Order[]; // Assuming 'Order' is the relation name in your Prisma User model for orders
  address: Address | null;
};

// --- Helper Functions ---

export function calculateUserAggregates(
  user: UserWithRelations,
): UserAggregates {
  // function calculateUserAggregates(user_from_prisma_with_included_Orders):
  //   initialize totalSpend = 0
  let totalSpend = 0;
  //   initialize orderCount = number of Orders associated with the user
  const orderCount = user.Order.length;
  //   initialize lastOrderDate = null
  let lastOrderDate: Date | null = null;

  //   for each order in user's Orders:
  for (const order of user.Order) {
    //     add order.totalAmount to totalSpend
    totalSpend += order.totalAmount;
    //     convert order.createdAt to a Date object
    const orderDate = new Date(order.createdAt);
    //     if lastOrderDate is null OR order.createdAt is more recent than lastOrderDate:
    if (!lastOrderDate || orderDate > lastOrderDate) {
      //       set lastOrderDate = order.createdAt (as Date object)
      lastOrderDate = orderDate;
    }
  }
  //   return { totalSpend, orderCount, lastOrderDate }
  return { totalSpend, orderCount, lastOrderDate };
}

export function evaluateCondition(
  user: UserWithRelations,
  aggregates: UserAggregates,
  condition: Condition,
): boolean {
  // function evaluateCondition(user_from_prisma_with_included_Address, calculated_user_aggregates, condition_to_evaluate):
  //   extract field, operator, value from condition_to_evaluate
  const { field, operator, value } = condition;
  let userValue: any;

  //   determine actual_user_value based on condition_to_evaluate.field:
  switch (field) {
    //     if field is "totalSpend", actual_user_value = calculated_user_aggregates.totalSpend
    case "totalSpend":
      userValue = aggregates.totalSpend;
      break;
    //     if field is "orderCount", actual_user_value = calculated_user_aggregates.orderCount
    case "orderCount":
      userValue = aggregates.orderCount;
      break;
    //     if field is "lastOrderDate", actual_user_value = calculated_user_aggregates.lastOrderDate (this is a Date object or null)
    case "lastOrderDate":
      userValue = aggregates.lastOrderDate;
      break;
    //     if field is "userCreatedAt", actual_user_value = new Date(user_from_prisma.createdAt)
    case "userCreatedAt":
      userValue = new Date(user.createdAt);
      break;
    //     if field is "email", actual_user_value = user_from_prisma.email
    case "email":
      userValue = user.email;
      break;
    //     if field is "name", actual_user_value = user_from_prisma.name
    case "name":
      userValue = user.name;
      break;
    //     if field is "city", actual_user_value = user_from_prisma.address?.city
    case "city":
      userValue = user.address?.city;
      break;
    //     if field is "state", actual_user_value = user_from_prisma.address?.state
    case "state":
      userValue = user.address?.state;
      break;
    //     if field is "country", actual_user_value = user_from_prisma.address?.country
    case "country":
      userValue = user.address?.country;
      break;
    //     otherwise: log warning for unknown field and return false
    default:
      console.warn(`evaluateCondition: Unknown field - ${field}`);
      return false;
  }

  // Strict null/undefined check for all types (date, number, string, etc.)
  if (userValue === null || userValue === undefined) {
    return false;
  }

  //   handle "isEmpty" / "isNotEmpty" operators:
  //     if operator is "isEmpty", return true if actual_user_value is null, undefined, or an empty string.
  if (operator === "isEmpty") {
    return userValue === null || userValue === undefined || userValue === "";
  }
  //     if operator is "isNotEmpty", return true if actual_user_value is NOT null, undefined, and NOT an empty string.
  if (operator === "isNotEmpty") {
    return userValue !== null && userValue !== undefined && userValue !== "";
  }

  //   if actual_user_value is null or undefined at this point (for operators other than isEmpty/isNotEmpty):
  //     return false (condition cannot be met with no value)
  if (userValue === null || userValue === undefined) {
    return false;
  }

  //   if field type is Date ("lastOrderDate", "userCreatedAt"):
  if (field === "lastOrderDate" || field === "userCreatedAt") {
    //     cast actual_user_value to Date
    const dateUserValue = userValue as Date; // Known to be a Date object here
    let comparisonDate: Date;
    try {
      //     based on operator ("olderThanDays", "newerThanDays", "onDate", "beforeDate", "afterDate"):
      switch (operator) {
        //       calculate comparison_date using condition_to_evaluate.value and current date (e.g., using date-fns)
        //       return result of comparing actual_user_value with comparison_date
        case "olderThanDays":
          comparisonDate = subDays(new Date(), Number(value));
          return isBefore(dateUserValue, comparisonDate);
        case "newerThanDays":
          comparisonDate = subDays(new Date(), Number(value));
          return isAfter(dateUserValue, comparisonDate);
        case "onDate":
          comparisonDate = parseISO(String(value));
          return isEqual(
            dateUserValue.setHours(0, 0, 0, 0),
            comparisonDate.setHours(0, 0, 0, 0),
          ); // Compare date part only
        case "beforeDate":
          comparisonDate = parseISO(String(value));
          return isBefore(dateUserValue, comparisonDate);
        case "afterDate":
          comparisonDate = parseISO(String(value));
          return isAfter(dateUserValue, comparisonDate);
        default:
          console.warn(
            `evaluateCondition: Unhandled date operator "${operator}" for field "${field}"`,
          );
          return false;
      }
    } catch (e) {
      console.error(
        `Date parsing/comparison error for operator ${operator}, value ${value}:`,
        e,
      );
      return false;
    }
  }

  //   if field type is Number ("totalSpend", "orderCount"):
  if (field === "totalSpend" || field === "orderCount") {
    //     convert actual_user_value and condition_to_evaluate.value to numbers
    const numericUserValue = Number(userValue);
    const numericConditionValue = Number(value);
    if (isNaN(numericUserValue) || isNaN(numericConditionValue)) return false; // Invalid number input

    //     based on operator ("equals", "greaterThan", "lessThan", etc.):
    //       return result of numeric comparison
    switch (operator) {
      case "equals":
        return numericUserValue === numericConditionValue;
      case "notEquals":
        return numericUserValue !== numericConditionValue;
      case "greaterThan":
        return numericUserValue > numericConditionValue;
      case "lessThan":
        return numericUserValue < numericConditionValue;
      case "greaterThanOrEqual":
        return numericUserValue >= numericConditionValue;
      case "lessThanOrEqual":
        return numericUserValue <= numericConditionValue;
      default:
        console.warn(
          `evaluateCondition: Unhandled numeric operator "${operator}" for field "${field}"`,
        );
        return false;
    }
  }

  //   if field type is String ("email", "name", "city", etc.):
  if (
    typeof userValue === "string" &&
    (typeof value === "string" || value === null || value === undefined)
  ) {
    //     convert actual_user_value and condition_to_evaluate.value to strings (typically lowercase for case-insensitivity)
    const stringUserValue = userValue.toLowerCase();
    const stringConditionValue = String(value ?? "").toLowerCase();

    //     based on operator ("equals", "contains", "startsWith", etc.):
    //       return result of string comparison
    switch (operator) {
      case "equals":
        return stringUserValue === stringConditionValue;
      case "notEquals":
        return stringUserValue !== stringConditionValue;
      case "contains":
        return stringUserValue.includes(stringConditionValue);
      case "notContains":
        return !stringUserValue.includes(stringConditionValue);
      case "startsWith":
        return stringUserValue.startsWith(stringConditionValue);
      case "endsWith":
        return stringUserValue.endsWith(stringConditionValue);
      default:
        console.warn(
          `evaluateCondition: Unhandled string operator "${operator}" for field "${field}"`,
        );
        return false;
    }
  }

  //   log warning for unhandled operator/field combination and return false
  console.warn(
    `evaluateCondition: Unhandled operator "${operator}" for field "${field}" or type mismatch. User value: ${userValue} (type: ${typeof userValue}), Condition value: ${value} (type: ${typeof value})`,
  );
  return false;
}

export function evaluateUserAgainstRuleGroups(
  user: UserWithRelations,
  aggregates: UserAggregates,
  rules: SegmentRules,
): boolean {
  // function evaluateUserAgainstRuleGroups(user_from_prisma_with_included_Address, calculated_user_aggregates, segment_rules):
  //   if segment_rules.groups is empty:
  //     return true (convention: an empty set of rules matches all users, or choose specific logic)
  if (rules.groups.length === 0) {
    return true;
  }

  //   for each group in segment_rules.groups: // This loop represents OR logic between groups
  for (const group of rules.groups) {
    //     assume current_group_matches = true
    let groupMatches = true;
    //     if group.conditions is empty:
    //       current_group_matches = false // Convention: an empty group of conditions does not match
    if (group.conditions.length === 0) {
      groupMatches = false;
    }

    //     for each condition in group.conditions: // This loop represents AND logic within a group
    for (const condition of group.conditions) {
      //       if evaluateCondition(user_from_prisma, calculated_user_aggregates, condition) is false:
      if (!evaluateCondition(user, aggregates, condition)) {
        //         set current_group_matches = false
        groupMatches = false;
        //         break from this inner loop (this group won't match)
        break;
      }
    }

    //     if current_group_matches is true:
    //       return true // User satisfies this group, so the OR condition for all groups is met
    if (groupMatches) {
      return true;
    }
  }
  //   return false // User did not satisfy any of the groups
  return false;
}
