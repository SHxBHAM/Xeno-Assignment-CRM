"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircle, Trash2, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Rule = {
  id: string
  field: string
  operator: string
  value: string
}

type RuleGroup = {
  id: string
  combinator: "AND" | "OR"
  rules: (Rule | RuleGroup)[]
}

export function RuleBuilder({ onUpdate }: { onUpdate: (size: number) => void }) {
  const [rootGroup, setRootGroup] = useState<RuleGroup>({
    id: "root",
    combinator: "AND",
    rules: [
      {
        id: "rule1",
        field: "spend",
        operator: ">",
        value: "10000",
      },
    ],
  })

  // Simulate audience calculation
  const calculateAudience = (group: RuleGroup) => {
    // In a real app, this would make an API call to calculate the audience size
    // For now, we'll just generate a random number
    const baseSize = 10000
    const ruleCount = countRules(group)
    const randomFactor = Math.random() * 0.5 + 0.5 // 0.5 to 1.0

    const size = Math.floor(baseSize / (ruleCount * randomFactor))
    onUpdate(size)
  }

  const countRules = (group: RuleGroup): number => {
    return group.rules.reduce((count, rule) => {
      if ("combinator" in rule) {
        return count + countRules(rule)
      }
      return count + 1
    }, 0)
  }

  const addRule = (groupId: string) => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      field: "visits",
      operator: "<",
      value: "3",
    }

    const updatedGroup = addRuleToGroup(rootGroup, groupId, newRule)
    setRootGroup(updatedGroup)
    calculateAudience(updatedGroup)
  }

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
    }

    const updatedGroup = addRuleToGroup(rootGroup, parentId, newGroup)
    setRootGroup(updatedGroup)
    calculateAudience(updatedGroup)
  }

  const addRuleToGroup = (group: RuleGroup, targetId: string, newRule: Rule | RuleGroup): RuleGroup => {
    if (group.id === targetId) {
      return {
        ...group,
        rules: [...group.rules, newRule],
      }
    }

    return {
      ...group,
      rules: group.rules.map((rule) => {
        if ("combinator" in rule) {
          return addRuleToGroup(rule, targetId, newRule)
        }
        return rule
      }),
    }
  }

  const updateRule = (ruleId: string, field: string, value: string) => {
    const updatedGroup = updateRuleInGroup(rootGroup, ruleId, field, value)
    setRootGroup(updatedGroup)
    calculateAudience(updatedGroup)
  }

  const updateRuleInGroup = (group: RuleGroup, ruleId: string, field: string, value: string): RuleGroup => {
    return {
      ...group,
      rules: group.rules.map((rule) => {
        if ("combinator" in rule) {
          return updateRuleInGroup(rule, ruleId, field, value)
        }

        if (rule.id === ruleId) {
          return {
            ...rule,
            [field]: value,
          }
        }

        return rule
      }),
    }
  }

  const removeRule = (ruleId: string) => {
    const updatedGroup = removeRuleFromGroup(rootGroup, ruleId)
    setRootGroup(updatedGroup)
    calculateAudience(updatedGroup)
  }

  const removeRuleFromGroup = (group: RuleGroup, ruleId: string): RuleGroup => {
    // Don't remove if it's the only rule in the root group
    if (
      group.id === "root" &&
      group.rules.length === 1 &&
      !("combinator" in group.rules[0]) &&
      group.rules[0].id === ruleId
    ) {
      return group
    }

    return {
      ...group,
      rules: group.rules
        .filter((rule) => {
          if ("combinator" in rule) {
            return true
          }
          return rule.id !== ruleId
        })
        .map((rule) => {
          if ("combinator" in rule) {
            return removeRuleFromGroup(rule, ruleId)
          }
          return rule
        }),
    }
  }

  const updateCombinator = (groupId: string, value: "AND" | "OR") => {
    const updatedGroup = updateCombinatorInGroup(rootGroup, groupId, value)
    setRootGroup(updatedGroup)
    calculateAudience(updatedGroup)
  }

  const updateCombinatorInGroup = (group: RuleGroup, groupId: string, value: "AND" | "OR"): RuleGroup => {
    if (group.id === groupId) {
      return {
        ...group,
        combinator: value,
      }
    }

    return {
      ...group,
      rules: group.rules.map((rule) => {
        if ("combinator" in rule) {
          return updateCombinatorInGroup(rule, groupId, value)
        }
        return rule
      }),
    }
  }

  const renderRuleGroup = (group: RuleGroup, depth = 0) => {
    return (
      <div className={`space-y-4 p-4 ${depth > 0 ? "border border-zinc-800 rounded-md" : ""}`} key={group.id}>
        {depth > 0 && (
          <div className="flex items-center mb-2">
            <Badge variant="outline" className="mr-2">
              Group
            </Badge>
            <Select
              value={group.combinator}
              onValueChange={(value) => updateCombinator(group.id, value as "AND" | "OR")}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
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
              )
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
                    <Select value={rule.field} onValueChange={(value) => updateRule(rule.id, "field", value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spend">Total Spend</SelectItem>
                        <SelectItem value="visits">Visit Count</SelectItem>
                        <SelectItem value="inactive_days">Inactive Days</SelectItem>
                        <SelectItem value="purchase_count">Purchase Count</SelectItem>
                        <SelectItem value="avg_order_value">Avg Order Value</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={rule.operator} onValueChange={(value) => updateRule(rule.id, "operator", value)}>
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
                      onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                      className="w-[120px]"
                    />

                    <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => addRule(group.id)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
          <Button variant="outline" size="sm" onClick={() => addGroup(group.id)}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Group
          </Button>
        </div>
      </div>
    )
  }

  return <div className="space-y-4">{renderRuleGroup(rootGroup)}</div>
}
