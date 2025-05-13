"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trash2, Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export type Rule = {
  id: string;
  field: string;
  operator: string;
  value: string;
};

export type RuleGroup = {
  id: string;
  combinator: "AND" | "OR";
  rules: (Rule | RuleGroup)[];
};

export function RuleBuilder({
  onUpdate,
  onRuleChange,
  initialRules,
}: {
  onUpdate: (size: number) => void;
  onRuleChange?: (rule: RuleGroup) => void;
  initialRules?: RuleGroup | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  console.log("RuleBuilder rendered with initialRules:", initialRules);

  const [rootGroup, setRootGroup] = useState<RuleGroup>(() => {
    console.log("Initializing rootGroup with:", initialRules);
    if (initialRules) {
      return initialRules;
    }
    return {
      id: "root",
      combinator: "AND",
      rules: [], // Start with no default rule
    };
  });

  // Update rootGroup when initialRules changes
  useEffect(() => {
    console.log("initialRules changed to:", initialRules);
    if (initialRules) {
      console.log("Updating rootGroup with new initialRules");
      setRootGroup(initialRules);
      updateAudienceSize();
    }
  }, [initialRules]);

  // For now, using a hardcoded value. This will be replaced with actual API call later
  const updateAudienceSize = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onUpdate(50000);
    } catch (error) {
      console.error("Error calculating audience size:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRootGroup = (newGroup: RuleGroup) => {
    console.log("Updating root group to:", newGroup);
    setRootGroup(newGroup);
    updateAudienceSize();
    onRuleChange?.(newGroup);
  };

  const addRule = (groupId: string) => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      field: "spend",
      operator: ">",
      value: "1000",
    };

    const updatedGroup = addRuleToGroup(rootGroup, groupId, newRule);
    updateRootGroup(updatedGroup);
  };

  const addGroup = (parentId: string) => {
    const newGroup: RuleGroup = {
      id: `group-${Date.now()}`,
      combinator: "OR",
      rules: [
        {
          id: `rule-${Date.now() + 1}`,
          field: "inactive_days",
          operator: ">",
          value: "90",
        },
      ],
    };

    const updatedGroup = addRuleToGroup(rootGroup, parentId, newGroup);
    updateRootGroup(updatedGroup);
  };

  const addRuleToGroup = (
    group: RuleGroup,
    targetId: string,
    newRule: Rule | RuleGroup
  ): RuleGroup => {
    if (group.id === targetId) {
      return {
        ...group,
        rules: [...group.rules, newRule],
      };
    }

    return {
      ...group,
      rules: group.rules.map((rule) => {
        if ("combinator" in rule) {
          return addRuleToGroup(rule, targetId, newRule);
        }
        return rule;
      }),
    };
  };

  const updateRule = (ruleId: string, field: string, value: string) => {
    const updatedGroup = updateRuleInGroup(rootGroup, ruleId, field, value);
    updateRootGroup(updatedGroup);
  };

  const updateRuleInGroup = (
    group: RuleGroup,
    ruleId: string,
    field: string,
    value: string
  ): RuleGroup => {
    return {
      ...group,
      rules: group.rules.map((rule) => {
        if ("combinator" in rule) {
          return updateRuleInGroup(rule, ruleId, field, value);
        }

        if (rule.id === ruleId) {
          return {
            ...rule,
            [field]: value,
          };
        }

        return rule;
      }),
    };
  };

  const removeRule = (ruleId: string) => {
    const updatedGroup = removeRuleFromGroup(rootGroup, ruleId);
    updateRootGroup(updatedGroup);
  };

  const removeRuleFromGroup = (group: RuleGroup, ruleId: string): RuleGroup => {
    // Allow removing the last rule in the root group (no blocking)
    // First, check if the rule to remove is in this group
    const updatedRules = group.rules.filter((rule) => {
      if (rule.id !== ruleId) {
        return true;
      }
      return false;
    });

    // If no rules were removed at this level, check nested groups
    if (updatedRules.length === group.rules.length) {
      return {
        ...group,
        rules: group.rules.map((rule) => {
          if ("combinator" in rule) {
            return removeRuleFromGroup(rule, ruleId);
          }
          return rule;
        }),
      };
    }

    // If this group would be empty after removal, remove the group itself (except root)
    if (updatedRules.length === 0 && group.id !== "root") {
      return {
        ...group,
        rules: [],
      };
    }

    // Return the group with updated rules
    return {
      ...group,
      rules: updatedRules,
    };
  };

  const updateCombinator = (groupId: string, value: "AND" | "OR") => {
    const updatedGroup = updateCombinatorInGroup(rootGroup, groupId, value);
    updateRootGroup(updatedGroup);
  };

  const updateCombinatorInGroup = (
    group: RuleGroup,
    groupId: string,
    value: "AND" | "OR"
  ): RuleGroup => {
    if (group.id === groupId) {
      return {
        ...group,
        combinator: value,
      };
    }

    return {
      ...group,
      rules: group.rules.map((rule) => {
        if ("combinator" in rule) {
          return updateCombinatorInGroup(rule, groupId, value);
        }
        return rule;
      }),
    };
  };

  const renderRuleGroup = (group: RuleGroup, depth = 0) => {
    return (
      <div
        className={`space-y-4 p-4 ${
          depth > 0 ? "border border-zinc-800 rounded-md" : ""
        }`}
        key={group.id}
      >
        {depth > 0 && (
          <div className="flex items-center mb-2">
            <Badge variant="outline" className="mr-2">
              Group
            </Badge>
            <Select
              value={group.combinator}
              onValueChange={(value) =>
                updateCombinator(group.id, value as "AND" | "OR")
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => removeRule(group.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {group.rules.map((rule, index) => {
            if ("combinator" in rule) {
              return (
                <div key={rule.id} className="mt-4">
                  {index > 0 && (
                    <div className="flex items-center justify-center my-2">
                      <Badge variant="secondary">{group.combinator}</Badge>
                    </div>
                  )}
                  {renderRuleGroup(rule, depth + 1)}
                </div>
              );
            }

            return (
              <div key={rule.id}>
                {index > 0 && (
                  <div className="flex items-center justify-center my-2">
                    <Badge variant="secondary">{group.combinator}</Badge>
                  </div>
                )}
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Select
                      value={rule.field}
                      onValueChange={(value) =>
                        updateRule(rule.id, "field", value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spend">Total Spend</SelectItem>
                        <SelectItem value="visits">Visit Count</SelectItem>
                        <SelectItem value="inactive_days">
                          Inactive Days
                        </SelectItem>
                        <SelectItem value="purchase_count">
                          Purchase Count
                        </SelectItem>
                        <SelectItem value="avg_order_value">
                          Avg Order Value
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={rule.operator}
                      onValueChange={(value) =>
                        updateRule(rule.id, "operator", value)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">{">"}</SelectItem>
                        <SelectItem value="<">{"<"}</SelectItem>
                        <SelectItem value=">=">{"≥"}</SelectItem>
                        <SelectItem value="<=">{"≤"}</SelectItem>
                        <SelectItem value="==">{"="}</SelectItem>
                        <SelectItem value="!=">{"≠"}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={rule.value}
                      onChange={(e) =>
                        updateRule(rule.id, "value", e.target.value)
                      }
                      className="w-[120px]"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRule(rule.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addRule(group.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add Rule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addGroup(group.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4 mr-1" />
            )}
            Add Group
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-4 border border-zinc-800 rounded-lg bg-zinc-900 animate-pulse space-y-2"
          >
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return <div className="space-y-4">{renderRuleGroup(rootGroup)}</div>;
}
