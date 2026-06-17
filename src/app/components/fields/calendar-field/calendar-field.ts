import { Component, ChangeDetectionStrategy, input, model, signal, computed } from '@angular/core';

interface DayInfo {
    day: number;
    isDisabled: boolean;
    isToday: boolean;
    isSelected: boolean;
    date: Date;
}

@Component({
    selector: 'app-calendar-field',
    imports: [],
    templateUrl: './calendar-field.html',
    styleUrl: './calendar-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class CalendarFieldComponent {
    label = input<string>('');
    placeholder = input<string>('');
    mask = input<string>('DD.MM.YYYY');
    minDate = input<string>('');
    maxDate = input<string>('');
    value = model<string>('');

    isOpen = signal(false);
    currentMonth = signal<number>(new Date().getMonth());
    currentYear = signal<number>(new Date().getFullYear());

    weekDays: string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    private monthNames: string[] = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ];

    get monthName(): string {
        return this.monthNames[this.currentMonth()];
    }

    days = computed<DayInfo[]>(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const minDateObj = this.minDate() ? this.parseDate(this.minDate()) : null;
        const maxDateObj = this.maxDate() ? this.parseDate(this.maxDate()) : null;
        const selectedDate = this.value() ? this.parseDate(this.value()) : null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result: DayInfo[] = [];

        for (let i = 0; i < startDay; i++) {
            result.push({ day: 0, isDisabled: true, isToday: false, isSelected: false, date: new Date(0) });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            date.setHours(0, 0, 0, 0);

            let isDisabled = false;
            if (minDateObj && date < minDateObj) isDisabled = true;
            if (maxDateObj && date > maxDateObj) isDisabled = true;

            const isToday = date.getTime() === today.getTime();
            const isSelected = selectedDate ? date.getTime() === selectedDate.getTime() : false;

            result.push({ day: d, isDisabled, isToday, isSelected, date });
        }

        return result;
    });

    private parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;

        let parts: string[];
        if (dateStr.includes('.')) {
            parts = dateStr.split('.');
            return new Date(+parts[2], +parts[1] - 1, +parts[0]);
        } else if (dateStr.includes('-')) {
            parts = dateStr.split('-');
            return new Date(+parts[0], +parts[1] - 1, +parts[2]);
        }
        return null;
    }

    private formatDate(date: Date): string {
        const mask = this.mask();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return mask.replace('DD', day).replace('MM', month).replace('YYYY', String(year));
    }

    toggleCalendar(): void {
        this.isOpen.update(v => !v);
    }

    closeCalendar(): void {
        this.isOpen.set(false);
    }

    selectDate(dayInfo: DayInfo): void {
        if (dayInfo.isDisabled) return;
        this.value.set(this.formatDate(dayInfo.date));
        this.isOpen.set(false);
    }

    prevMonth(): void {
        if (this.currentMonth() === 0) {
            this.currentMonth.set(11);
            this.currentYear.update(y => y - 1);
        } else {
            this.currentMonth.update(m => m - 1);
        }
    }

    nextMonth(): void {
        if (this.currentMonth() === 11) {
            this.currentMonth.set(0);
            this.currentYear.update(y => y + 1);
        } else {
            this.currentMonth.update(m => m + 1);
        }
    }

    prevYear(): void {
        this.currentYear.update(y => y - 1);
    }

    nextYear(): void {
        this.currentYear.update(y => y + 1);
    }
}
