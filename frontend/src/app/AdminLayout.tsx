import { Anchor, AppShell, Button, Container, Group, SegmentedControl, Text } from "@mantine/core";
import { IconArrowLeft, IconCalendar, IconSettings } from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const ADMIN_TABS = [
  { label: "Типы событий", value: "/admin", icon: IconSettings },
  { label: "Встречи", value: "/admin/bookings", icon: IconCalendar },
];

export function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab =
    ADMIN_TABS.find((t) => t.value === pathname)?.value ?? "/admin";

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
            <Anchor component={Link} to="/book" size="sm" c="dimmed">
              <Group gap={4}>
                <IconArrowLeft size={14} />
                Назад
              </Group>
            </Anchor>
            <Button
              component={Link}
              to="/admin"
              variant="filled"
              color="orange"
              size="sm"
            >
              Админка
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ background: "#f8f9fa" }}>
        <Container size="md">
          <SegmentedControl
            value={activeTab}
            onChange={(value) => navigate(value)}
            data={ADMIN_TABS.map((t) => ({
              label: t.label,
              value: t.value,
            }))}
            color="orange"
            fullWidth
            mb="lg"
          />
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
