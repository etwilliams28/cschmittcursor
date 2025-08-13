export const formatBusinessHours = (hours: Record<string, string> | null | undefined): string => {
  if (!hours || typeof hours !== 'object') {
    return 'Mon-Fri: 7AM-6PM | Sat: 8AM-4PM';
  }

  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const saturday = hours.saturday;
  const sunday = hours.sunday;

  // Check if all weekdays have the same hours
  const weekdayHours = hours.monday;
  const allWeekdaysSame = weekdays.every(day => hours[day] === weekdayHours);

  if (allWeekdaysSame && weekdayHours) {
    let formatted = `Mon-Fri: ${weekdayHours}`;
    
    if (saturday && saturday !== 'Closed') {
      formatted += ` | Sat: ${saturday}`;
    }
    
    if (sunday && sunday !== 'Closed') {
      formatted += ` | Sun: ${sunday}`;
    }
    
    return formatted;
  }

  // If weekdays are different, format them individually
  const formattedDays: string[] = [];
  
  weekdays.forEach(day => {
    if (hours[day] && hours[day] !== 'Closed') {
      const dayAbbr = day.charAt(0).toUpperCase() + day.slice(1, 3);
      formattedDays.push(`${dayAbbr}: ${hours[day]}`);
    }
  });

  if (saturday && saturday !== 'Closed') {
    formattedDays.push(`Sat: ${saturday}`);
  }

  if (sunday && sunday !== 'Closed') {
    formattedDays.push(`Sun: ${sunday}`);
  }

  return formattedDays.join(' | ') || 'Hours vary by day';
};

export const formatDetailedHours = (hours: Record<string, string> | null | undefined): string[] => {
  if (!hours || typeof hours !== 'object') {
    return [
      'Mon-Fri: 7:00 AM - 6:00 PM',
      'Sat: 8:00 AM - 4:00 PM',
      'Sun: Closed'
    ];
  }

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  return days.map(day => {
    const hoursForDay = hours[day.key];
    if (hoursForDay && hoursForDay !== 'Closed') {
      return `${day.label}: ${hoursForDay}`;
    }
    return `${day.label}: Closed`;
  });
}; 