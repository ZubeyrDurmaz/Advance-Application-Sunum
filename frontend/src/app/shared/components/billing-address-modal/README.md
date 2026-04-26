# Billing Address Selection Modal

A reusable Angular component for selecting existing addresses as billing addresses with account holder name input.

## Features

- **Address Selection**: Displays all available user addresses as selectable options
- **Account Holder Input**: Validates and captures account holder name for billing
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Works on desktop and mobile devices
- **Form Validation**: Real-time validation with user-friendly error messages
- **Loading States**: Shows loading indicators during API calls
- **Error Handling**: Graceful error handling with user feedback

## Usage

```typescript
import { BillingAddressModalComponent } from './shared/components/billing-address-modal/billing-address-modal.component';

@Component({
  imports: [BillingAddressModalComponent],
  // ...
})
export class MyComponent {
  showBillingModal = false;

  openBillingModal() {
    this.showBillingModal = true;
  }

  onBillingModalClosed() {
    this.showBillingModal = false;
  }

  onBillingAddressSet(billingProfile: BillingProfile) {
    console.log('Billing address set:', billingProfile);
    this.showBillingModal = false;
  }
}
```

```html
<app-billing-address-modal
  [show]="showBillingModal"
  (closed)="onBillingModalClosed()"
  (billingAddressSet)="onBillingAddressSet($event)"
></app-billing-address-modal>
```

## API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | `boolean` | `false` | Controls modal visibility |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `closed` | `void` | Emitted when modal is closed |
| `billingAddressSet` | `BillingProfile` | Emitted when billing address is successfully set |

## Validation Rules

### Account Holder Name
- **Required**: Must not be empty
- **Minimum Length**: At least 2 characters
- **Pattern**: Only letters, spaces, and common punctuation (Turkish characters supported)

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and Escape keys
- **Focus Management**: Automatic focus handling when opening/closing modal
- **High Contrast**: Support for high contrast mode
- **Screen Reader**: Compatible with screen readers

## Dependencies

- `@angular/core`
- `@angular/common`
- `@angular/forms` (ReactiveFormsModule)
- `BillingAddressService`
- `ToastService`

## Testing

The component includes comprehensive unit tests covering:
- Form validation
- Address selection
- API integration
- Error handling
- Accessibility features

Run tests with:
```bash
npm test -- --include="**/billing-address-modal.component.spec.ts"
```

## Requirements Fulfilled

This component fulfills the following requirements from the billing address management spec:

- **Requirement 1.1**: Display all existing user addresses as selectable billing address options
- **Requirement 1.2**: When user selects an existing address as billing address, mark it as the active billing address
- **Requirement 4.3**: When creating or editing billing address, require Account_Holder name as a mandatory field

## Integration

The modal is integrated into the payments component and can be triggered by clicking the "Edit Billing Profile" or "Set Up Billing Address" button in the billing panel.