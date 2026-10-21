import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FileManagerService } from '../../../services/file-manager.service';
import { FileManagerDirectoryEntry } from '../../../models/responses/file-manager/file-manager-directory-entry.model';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-manager-tree',
    templateUrl: './file-manager-tree.html',
    styleUrl: './file-manager-tree.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IconComponent,
        FileManagerTreeComponent,
    ],
    standalone: true
})
export class FileManagerTreeComponent {
    private readonly fileManagerService = inject(FileManagerService);

    readonly path = input<string>('');
    readonly expandToPath = input<string>('');
    readonly navigate = output<string>();

    readonly directories = signal<FileManagerDirectoryEntry[]>([]);
    readonly loading = signal<boolean>(false);
    readonly expanded = signal<Set<string>>(new Set());

    /** First segment of expandToPath for this level */
    private readonly expandSegment = computed(() => {
        const p = this.expandToPath();
        if (!p) return '';
        return p.split('/')[0];
    });

    /** Rest of expandToPath to pass to child trees */
    readonly childExpandPath = computed(() => {
        const p = this.expandToPath();
        if (!p) return '';
        const parts = p.split('/');
        return parts.slice(1).join('/');
    });

    constructor() {
        effect(() => {
            this.path();
            this.load();
        });

        // Auto-expand when expandToPath changes and directories are loaded
        effect(() => {
            const segment = this.expandSegment();
            const dirs = this.directories();
            if (!segment || !dirs.length) return;

            const dir = dirs.find(d => d.name === segment);
            if (dir && !this.isExpanded(dir.name)) {
                const set = new Set(this.expanded());
                set.add(dir.name);
                this.expanded.set(set);
            }
        });
    }

    async load(): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.fileManagerService.readDirectory(this.path());
            this.directories.set(response.data.directories);
        } finally {
            this.loading.set(false);
        }
    }

    fullPath(dir: FileManagerDirectoryEntry): string {
        return dir.path;
    }

    toggleExpand(name: string): void {
        const set = new Set(this.expanded());
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        this.expanded.set(set);
    }

    isExpanded(name: string): boolean {
        return this.expanded().has(name);
    }

    onNavigate(path: string): void {
        this.navigate.emit(path);
    }
}
