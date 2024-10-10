export default async function () {
  figma.notify('Plugin started');

  if (figma.currentUser) {
    figma.notify(`Current user: ${figma.currentUser.name}`);
  } else {
    figma.notify('No current user found');
  }

  // Остальной код инициализации плагина...
}