/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Lucide from 'lucide-react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  className?: string;
  size?: number;
}

export default function Icon({ name, className, size = 20, ...props }: IconProps) {
  const IconComponent = (Lucide as any)[name] || Lucide.HelpCircle;
  return <IconComponent className={className} size={size} {...props} />;
}
