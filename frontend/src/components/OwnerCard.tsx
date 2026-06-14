import { Avatar, Badge, Group, Stack, Text } from "@mantine/core";
import { OWNER } from "../lib/owner";

interface OwnerCardProps {
  /** Внутри карточки-шапки (каталог/слоты) — компактный вид. */
  compact?: boolean;
}

/** Карточка профиля владельца (захардкоженные данные). */
export function OwnerCard({ compact }: OwnerCardProps) {
  return (
    <Group gap="sm" align="center">
      <Avatar color="orange" radius="xl" size={compact ? "md" : "lg"}>
        {OWNER.name[0]}
      </Avatar>
      <Stack gap={0}>
        <Text fw={600} size={compact ? "sm" : "md"}>
          {OWNER.name}
        </Text>
        <Badge variant="light" color="orange" size="sm" mt={2}>
          {OWNER.role}
        </Badge>
      </Stack>
    </Group>
  );
}