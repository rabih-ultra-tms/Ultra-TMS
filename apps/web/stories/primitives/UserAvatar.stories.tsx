import type { Meta, StoryObj } from "@storybook/react";
import { UserAvatar } from "@/components/tms/primitives";

const meta: Meta<typeof UserAvatar> = {
  title: "Primitives/UserAvatar",
  component: UserAvatar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    name: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: { name: "John Smith" },
};

export const SingleName: Story = {
  args: { name: "Admin" },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <UserAvatar name="Sarah Johnson" size={size} />
          <span className="text-[10px] text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const DispatchTeam: Story = {
  render: () => {
    const team = [
      "John Smith",
      "Sarah Johnson",
      "Mike Chen",
      "Emily Davis",
      "Alex Rivera",
      "Chris Wilson",
    ];
    return (
      <div className="flex flex-col gap-3">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Dispatch Team
        </div>
        <div className="flex -space-x-1.5">
          {team.map((name) => (
            <UserAvatar
              key={name}
              name={name}
              size="md"
              className="ring-2 ring-surface"
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {team.map((name) => (
            <div key={name} className="flex items-center gap-2">
              <UserAvatar name={name} size="sm" />
              <span className="text-xs text-text-primary">{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
