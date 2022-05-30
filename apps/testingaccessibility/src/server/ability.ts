import {AbilityBuilder, Ability, AbilityClass} from '@casl/ability'
import {isEmpty} from 'lodash'
import {
  hasAvailableSeats,
  hasBulkPurchase,
  hasValidPurchase,
} from '../utils/purchase-validators'

type Actions = 'manage' | 'invite' | 'view'
type Subjects = 'Team' | 'Purchase' | 'Content' | 'Product' | 'all'
type AppAbility = Ability<[Actions, Subjects]>
const AppAbility = Ability as AbilityClass<AppAbility>

type ViewerAbilityInput = {
  purchases?: any[]
  rules?: any
}

/**
 * Creates an ability uses cached rules or the properties
 * to define a set of rules (purchases)
 * @param viewerAbilityInput
 */
export async function getCurrentAbility(
  viewerAbilityInput: ViewerAbilityInput,
): Promise<AppAbility> {
  return defineAbilityFor(viewerAbilityInput)
}

/**
 * factory to create an instance of an app ability
 * to use and determine if the viewer has access to
 * various things
 *
 * if the input has a set of rules, use those rules
 * otherwise, use the purchases and create rules
 * @see {@link https://casl.js.org/v5/en/guide/define-rules#ability-builder-class|AbilityBuilder}
 * @param viewerAbilityInput
 */
export async function defineAbilityFor(viewerAbilityInput: ViewerAbilityInput) {
  const rules = isEmpty(viewerAbilityInput.rules)
    ? await defineRulesForPurchases(viewerAbilityInput.purchases || [])
    : viewerAbilityInput.rules
  return new AppAbility(rules)
}

/**
 * Creates a structure of rules to use in the ability from list of purchases
 *
 * @param purchases
 */
export async function defineRulesForPurchases(purchases: any[]) {
  const {can, rules} = new AbilityBuilder(AppAbility)

  if (hasAvailableSeats(purchases)) {
    can('invite', 'Team')
  }

  if (hasBulkPurchase(purchases)) {
    can('view', 'Team')
  }

  console.log({purchases})

  if (hasValidPurchase(purchases)) {
    can('view', 'Content')
    can('view', 'Product', {
      productId: {
        $in: purchases?.map((purchase: any) => purchase.productId),
      },
    })
  }

  return rules
}
