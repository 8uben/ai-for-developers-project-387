import { AppShell, Button, Group, Anchor, Text } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Anchor component={Link} to="/" underline="never" c="dark" fw={700}>
            <Group gap="xs">
              <IconCalendar size={24} />
              <Text fw={700} size="lg">
                Calendar
              </Text>
            </Group>
          </Anchor>
          <Group gap="xs">
            <Button
              component={Link}
              to="/book"
              variant={pathname.startsWith("/book") ? "filled" : "light"}
              color="orange"
              size="sm"
            >
              Записаться
            </Button>
            <Button
              component={Link}
              to="/admin"
              variant={pathname.startsWith("/admin") ? "filled" : "light"}
              color="orange"
              size="sm"
            >
              Админка
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ background: "#f8f9fa" }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
