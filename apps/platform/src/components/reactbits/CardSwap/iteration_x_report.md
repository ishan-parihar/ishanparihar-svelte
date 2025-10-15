# CardSwap Component Analysis Report

## 1. Props Interface

```typescript
export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  children: ReactNode;
}
```

## 2. Data Structure for Cards/Items

The CardSwap component doesn't define a specific data structure for items. Instead, it works with React children components. Each child should be a valid React element that can be cloned and enhanced with additional props.

There is also a specific Card component exported from the same file that can be used as children:

```typescript
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}
```

Example usage with the Card component:
```tsx
<Card customClass="bg-blue-500">
  <h3>Card Content</h3>
  <p>This is a card</p>
</Card>
```

## 3. Styling and Dependencies

### Dependencies:
- React (core library)
- GSAP (GreenSock Animation Platform) for animations

### Styling Implementation:
The component uses Tailwind CSS classes extensively for styling:
- Cards are styled with classes like `absolute`, `top-1/2`, `left-1/2`, `rounded-xl`, `border`, `bg-black`, etc.
- The container uses classes like `absolute`, `bottom-0`, `right-0`, `perspective-[900px]`, etc.
- Responsive adjustments are made with classes like `max-[768px]:translate-x-[25%]`
- The component also uses inline styles for width and height

## 4. JSX Usage Example

```tsx
import CardSwap, { Card } from './CardSwap';

function App() {
  return (
    <CardSwap 
      width={500}
      height={400}
      cardDistance={60}
      verticalDistance={70}
      delay={5000}
      pauseOnHover={true}
      skewAmount={6}
      easing="elastic"
    >
      <Card customClass="bg-red-500">
        <div className="p-6">
          <h3 className="text-xl font-bold">Card 1</h3>
          <p>First card content</p>
        </div>
      </Card>
      <Card customClass="bg-blue-500">
        <div className="p-6">
          <h3 className="text-xl font-bold">Card 2</h3>
          <p>Second card content</p>
        </div>
      </Card>
      <Card customClass="bg-green-500">
        <div className="p-6">
          <h3 className="text-xl font-bold">Card 3</h3>
          <p>Third card content</p>
        </div>
      </Card>
    </CardSwap>
  );
}
```

## 5. Confirmation

No files were modified during this analysis. This was a strictly read-only investigation of the CardSwap component located at `apps/platform/src/components/reactbits/CardSwap/CardSwap.tsx`.