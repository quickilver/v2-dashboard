import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    templateUrl: './skeleton.html',
    styleUrl: './skeleton.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'skeleton-host',
    },
})
export class SkeletonComponent {
    /** Ширина блока в пикселях (число) или любая CSS-величина (строка). */
    width = input<number | string>('100%');

    /** Высота блока в пикселях (число) или любая CSS-величина (строка). */
    height = input<number | string>(16);

    /** Количество строк скелетона. */
    count = input<number>(1);

    /** Радиус скругления в пикселях. */
    radius = input<number>(4);

    /** Отступ между строками в пикселях. */
    gap = input<number>(8);

    /** Круглый скелетон (например, для аватара). */
    circle = input<boolean>(false);

    items = computed<number[]>(() => Array.from({ length: Math.max(1, this.count()) }));

    containerStyle = computed<Record<string, string>>(() => ({
        gap: `${this.gap()}px`,
    }));

    itemStyles = computed<Record<string, string>[]>(() => {
        const count = Math.max(1, this.count());
        const width = this.toCssSize(this.width());
        const height = this.toCssSize(this.height());
        const borderRadius = this.circle() ? '50%' : `${this.radius()}px`;

        return Array.from({ length: count }, (_, index) => ({
            width: this.resolveWidth(width, count, index),
            height,
            'border-radius': borderRadius,
        }));
    });

    private resolveWidth(width: string, count: number, index: number): string {
        if (count === 1 || this.circle()) {
            return width;
        }

        const isLast = index === count - 1;
        const min = isLast ? 40 : 60;
        const max = isLast ? 75 : 100;
        const percent = Math.round(min + Math.random() * (max - min));

        return `calc(${width} * ${percent / 100})`;
    }

    private toCssSize(value: number | string): string {
        return typeof value === 'number' ? `${value}px` : value;
    }
}
