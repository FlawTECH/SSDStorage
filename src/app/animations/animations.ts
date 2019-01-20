import {
    trigger, state, style, transition,
    animate, group, query, stagger, keyframes
} from '@angular/animations';

export const animations = [
    trigger('grow', [
        state('collapsed', style({
            height: '{{grid_size}}',
        }), { params: { grid_size: '3em' } }),
        state('expanded', style({
            height: '{{grid_size}}'
        }), { params: { grid_size: '3em' } }),
        transition('collapsed <=> expanded', animate('0.3s ease'))
    ])

]