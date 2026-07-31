import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoBackend } from './core/api/demo-backend.service';
import { AuthenticationService } from './core/api/authentication.service';
import { ApiError } from './core/models/authentication.model';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface Mentor {
  id: number;
  name: string;
  field: string;
  description: string;
  research_area?: string;
  photo?: string;
  workshop_title?: string;
  pending_requests?: number;
  total_requests?: number;
}

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  team_size?: number;
  mentor_id?: number;
  mentor_name?: string;
  accepted?: number;
  capacity?: number;
  available?: number;
  is_full?: boolean;
  members?: RequestItem[];
}

interface RequestItem {
  id: number;
  request_type: 'mentor' | 'project';
  status: string;
  mentor_id?: number;
  mentor_name?: string;
  project_id?: number;
  project_title?: string;
  student_name: string;
  email: string;
  role?: string;
  faculty?: string;
  skills?: string;
  availability?: string;
  interest?: string;
  intro?: string;
  message?: string;
}

interface StudentSession {
  email: string;
  student_name: string;
  pending: number;
  accepted: number;
  requests: RequestItem[];
}

interface MentorSession {
  mentor: Mentor;
  requests: RequestItem[];
  projects: Project[];
}

interface ChatMessage {
  from: 'student' | 'assistant';
  text: string;
}

type AuthModal =
  | 'student-login'
  | 'student-register'
  | 'mentor-login'
  | 'mentor-register'
  | 'admin-login'
  | null;

interface AdminStudent {
  id: number;
  name: string;
  email: string;
  photo_url?: string;
  created_at: string;
}

interface AdminData {
  students: AdminStudent[];
  pending: Mentor[];
  approved: Mentor[];
  rejected: Mentor[];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private readonly demo = inject(DemoBackend);
  private readonly authentication = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(NonNullableFormBuilder);

  mentors = signal<Mentor[]>([]);
  projects = signal<Project[]>([]);
  status = signal<Status>('idle');
  currentPage = signal('home');
  notice = signal('');
  authBusy = signal(false);
  student = signal<StudentSession | null>(null);
  mentorSession = signal<MentorSession | null>(null);
  chatMessages = signal<ChatMessage[]>([
    {
      from: 'assistant',
      text: 'Ask me how to find a mentor, submit a project, choose a STEM area, or understand the portal flow.'
    }
  ]);
  chatBusy = signal(false);
  adminLoggedIn = signal(false);
  adminData = signal<AdminData | null>(null);
  authModal: AuthModal = null;

  readonly studentForm = this.fb.group({
    student_name: ['Rafi Demo Student', Validators.required],
    email: ['demo.student@mmu.edu.my', [Validators.required, Validators.email]],
    password: ['student123', Validators.required]
  });
  readonly mentorRequestForm = this.fb.group({
    mentor_id: ['', Validators.required],
    interest: ['', Validators.required],
    message: ['']
  });
  readonly projectRequestForm = this.fb.group({
    project_id: [''],
    mentor_id: ['', Validators.required],
    project_title: [''],
    role: [''],
    faculty: [''],
    skills: [''],
    availability: [''],
    intro: [''],
    message: ['']
  });
  readonly mentorLoginForm = this.fb.group({
    email: ['aisha.rahman@mmu.edu.my', [Validators.required, Validators.email]],
    access_code: ['mentor123', Validators.required]
  });
  readonly mentorRegistrationForm = this.fb.group({
    name: ['', Validators.required],
    field: ['', Validators.required],
    description: ['', Validators.required],
    research_area: [''],
    email: ['', [Validators.required, Validators.email]],
    access_code: ['', Validators.required],
    workshop_title: [''],
    workshop_description: ['']
  });
  readonly newProjectForm = this.fb.group({
    title: ['', Validators.required],
    category: [''],
    description: [''],
    team_size: [4, [Validators.min(1), Validators.max(5)]]
  });
  readonly chatForm = this.fb.group({ message: [''] });
  readonly adminLoginForm = this.fb.group({
    identifier: ['ADM001', Validators.required],
    password: ['admin123', Validators.required]
  });
  portalTab: 'mentors' | 'projects' | 'workspace' = 'mentors';
  adminTab: 'students' | 'pending' | 'approved' | 'rejected' = 'pending';
  mentorAuthMode: 'login' | 'register' = 'login';

  // Thought bubble cycling
  thoughtMessages = [
    'Thinking... start with a mentor, choose a STEM track, then turn your idea into a real project.',
    'Need a plan? Pick AI, robotics, IoT, software, or data science and I will guide your next step.',
    'Tip: ask STEM Bot about mentors, projects, project roles, or how to submit a strong request.',
    'Great projects begin with one clear problem. What campus challenge would you solve first?',
    'Welcome to the STEM Portal! Ready to build something awesome? 🚀',
    'Find a mentor and kickstart your STEM journey! 🧪',
    'Got an idea? Join a project team today! 💡',
    'AI, IoT, Robotics — explore all STEM fields here! 🤖',
    'Register as a mentor and inspire the next generation! ⭐',
    'Need help? Ask the STEM Bot anything! 💬',
    'MMU Cyberjaya & Melaka — two campuses, one mission! 🎓',
  ];
  thoughtIndex = 0;
  thoughtFading = false;
  private thoughtInterval: ReturnType<typeof setInterval> | null = null;

  // Floating chatbot
  private readonly chatLauncherSize = 68;
  chatOpen = false;
  chatPos = this.clampPosition({ x: window.innerWidth - 400, y: window.innerHeight - 540 }, this.chatWindowWidth(), this.chatWindowHeight());
  chatLauncherPos = this.clampPosition({ x: window.innerWidth - 92, y: window.innerHeight - 92 }, this.chatLauncherSize, this.chatLauncherSize);
  chatDragging = false;
  launcherDragging = false;

  acceptedMentorCount = computed(() =>
    (this.student()?.requests ?? []).filter((request) => request.request_type === 'mentor' && request.status === 'accepted').length
  );

  activeRequests = computed(() =>
    (this.student()?.requests ?? []).filter((request) => !['withdrawn', 'removed', 'project_deleted'].includes(request.status))
  );

  ngOnInit(): void {
    this.setCurrentPage(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setCurrentPage(event.urlAfterRedirects);
      }
    });
    this.refreshCatalog();
    this.refreshStudentSession(false);
    this.refreshMentorSession(false);
    this.startThoughtCycle();
  }

  ngOnDestroy(): void {
    if (this.thoughtInterval) {
      clearInterval(this.thoughtInterval);
    }
  }

  private startThoughtCycle(): void {
    this.thoughtInterval = setInterval(() => {
      this.thoughtFading = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.thoughtIndex = (this.thoughtIndex + 1) % this.thoughtMessages.length;
        this.thoughtFading = false;
        this.cdr.detectChanges();
      }, 500);
    }, 4000);
  }

  useMascotFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    const fallbackIndex = Number(image.dataset['fallbackIndex'] ?? '0');
    const fallbacks = ['/static/img/ebee-home.png', '/assets/mmu-ebee.png', '/static/img/mmu-ebee.png'];

    if (fallbackIndex < fallbacks.length) {
      image.dataset['fallbackIndex'] = String(fallbackIndex + 1);
      image.src = fallbacks[fallbackIndex];
      return;
    }

    image.style.display = 'none';
  }

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen) {
      this.chatPos = this.clampPosition(this.chatPos, this.chatWindowWidth(), this.chatWindowHeight());
    }
  }

  openChatFromLauncher(event: MouseEvent): void {
    if (this.launcherMoved) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.chatPos = this.clampPosition(
      {
        x: this.chatLauncherPos.x - this.chatWindowWidth() + this.chatLauncherSize,
        y: this.chatLauncherPos.y - this.chatWindowHeight() - 14
      },
      this.chatWindowWidth(),
      this.chatWindowHeight()
    );
    this.chatOpen = true;
  }

  private setCurrentPage(url: string): void {
    const page = url.split('?')[0].replace('/', '') || 'home';
    this.currentPage.set(page);
  }

  openAuthModal(modal: Exclude<AuthModal, null>): void {
    this.authModal = modal;
  }

  closeAuthModal(): void {
    this.authModal = null;
  }

  private syncDemoSession(message = ''): void {
    const catalog = this.demo.catalog();

    this.mentors.set(catalog.mentors);
    this.projects.set(catalog.projects);
    if (this.student()) {
      this.student.set(this.demo.studentSession());
    }
    if (this.mentorSession()) {
      this.mentorSession.set(this.demo.mentorSession());
    }
    if (this.adminLoggedIn()) {
      this.adminData.set(this.demo.adminData());
    }
    this.status.set('ready');

    if (message) {
      this.notice.set(message);
    }
  }

  refreshCatalog(): void {
    this.status.set('loading');
    this.syncDemoSession();
  }

  loginStudent(): void {
    if (this.studentForm.invalid || this.authBusy()) return;
    const form = this.studentForm.getRawValue();
    this.authBusy.set(true);
    this.authentication.login('student', {
      identifier: form.email,
      password: form.password
    }).subscribe({
      next: (response) => {
        this.student.set(this.demo.loginStudent(form));
        this.closeAuthModal();
        this.portalTab = 'workspace';
        this.syncDemoSession(`${response.message} Demo student workspace is ready.`);
        this.authBusy.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleAuthError(error)
    });
  }

  registerStudent(): void {
    if (this.studentForm.invalid || this.authBusy()) return;
    const form = this.studentForm.getRawValue();
    this.authBusy.set(true);
    this.authentication.registerStudent({
      name: form.student_name,
      email: form.email,
      password: form.password
    }).subscribe({
      next: (response) => {
        this.student.set(this.demo.registerStudent(form));
        this.closeAuthModal();
        this.portalTab = 'workspace';
        this.syncDemoSession(`${response.message} Your actor ID is ${response.user.actorId}.`);
        this.authBusy.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleAuthError(error)
    });
  }

  refreshStudentSession(showErrors = true): void {
    void showErrors;
    this.syncDemoSession();
  }

  sendMentorRequest(): void {
    if (this.mentorRequestForm.invalid) return;
    const message = this.demo.sendMentorRequest(this.mentorRequestForm.getRawValue());
    this.mentorRequestForm.reset({ mentor_id: '', interest: '', message: '' });
    this.portalTab = 'workspace';
    this.syncDemoSession(message);
  }

  sendProjectRequest(): void {
    if (this.projectRequestForm.invalid) return;
    const request = this.projectRequestForm.getRawValue();
    const selectedProject = this.projects().find((project) => String(project.id) === String(request.project_id));
    const message = this.demo.sendProjectRequest({
      ...request,
      project_title: request.project_title || selectedProject?.title || ''
    });
    this.projectRequestForm.reset({ project_id: '', mentor_id: '', project_title: '', role: '', faculty: '', skills: '', availability: '', intro: '', message: '' });
    this.portalTab = 'workspace';
    this.syncDemoSession(message);
  }

  withdrawRequest(request: RequestItem): void {
    this.syncDemoSession(this.demo.withdrawRequest(request.id));
  }

  registerMentor(): void {
    if (this.mentorRegistrationForm.invalid || this.authBusy()) return;
    const form = this.mentorRegistrationForm.getRawValue();
    this.authBusy.set(true);
    this.authentication.registerMentor({
      name: form.name,
      email: form.email,
      password: form.access_code
    }).subscribe({
      next: (response) => {
        const message = this.demo.registerMentor(form);
        this.mentorRegistrationForm.reset({ name: '', field: '', description: '', research_area: '', email: '', access_code: '', workshop_title: '', workshop_description: '' });
        this.closeAuthModal();
        this.mentorAuthMode = 'login';
        this.adminTab = 'pending';
        this.syncDemoSession(`${message} Your actor ID is ${response.user.actorId}.`);
        this.authBusy.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleAuthError(error)
    });
  }

  loginMentor(): void {
    if (this.mentorLoginForm.invalid || this.authBusy()) return;
    const form = this.mentorLoginForm.getRawValue();
    this.authBusy.set(true);
    this.authentication.login('mentor', {
      identifier: form.email,
      password: form.access_code
    }).subscribe({
      next: (response) => {
        this.mentorSession.set(this.demo.loginMentor());
        this.closeAuthModal();
        this.syncDemoSession(`${response.message} Demo mentor workspace is ready.`);
        this.authBusy.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleAuthError(error)
    });
  }

  refreshMentorSession(showErrors = true): void {
    void showErrors;
    this.syncDemoSession();
  }

  decideRequest(request: RequestItem, action: 'accepted' | 'rejected'): void {
    this.syncDemoSession(this.demo.decideRequest(request.id, action));
  }

  createMentorProject(): void {
    if (this.newProjectForm.invalid) return;
    const message = this.demo.createMentorProject(this.newProjectForm.getRawValue());
    this.newProjectForm.reset({ title: '', category: '', description: '', team_size: 4 });
    this.syncDemoSession(message);
  }

  askChatbot(): void {
    const question = this.chatForm.controls.message.value.trim();
    if (!question) {
      return;
    }
    this.chatMessages.update((messages) => [...messages, { from: 'student', text: question }]);
    this.chatForm.controls.message.setValue('');
    this.chatBusy.set(true);
    window.setTimeout(() => {
      this.chatMessages.update((messages) => [...messages, { from: 'assistant', text: this.demo.chatReply(question) }]);
      this.chatBusy.set(false);
      this.cdr.detectChanges();
    }, 650);
  }

  initials(name = 'MMU'): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  quickMentorRequest(mentor: Mentor): void {
    this.mentorRequestForm.setValue({
      mentor_id: String(mentor.id),
      interest: mentor.field || '',
      message: `I'd like to connect with ${mentor.name} for mentorship.`
    });
    this.sendMentorRequest();
  }

  quickProjectRequest(project: Project): void {
    this.projectRequestForm.patchValue({
      project_id: String(project.id),
      project_title: project.title,
      mentor_id: String(project.mentor_id || ''),
      intro: `Requesting to join ${project.title}.`
    });
    this.sendProjectRequest();
  }

  loginAdmin(): void {
    if (this.adminLoginForm.invalid || this.authBusy()) return;
    const form = this.adminLoginForm.getRawValue();
    this.authBusy.set(true);
    this.authentication.login('admin', form).subscribe({
      next: (response) => {
        this.adminLoggedIn.set(true);
        this.closeAuthModal();
        this.syncDemoSession(`${response.message} Demo admin dashboard is ready.`);
        this.authBusy.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleAuthError(error)
    });
  }

  private handleAuthError(error: HttpErrorResponse): void {
    const apiError = error.error as ApiError | null;
    this.notice.set(apiError?.message || 'Authentication service is unavailable. Start the Flask backend and try again.');
    this.authBusy.set(false);
  }

  refreshAdminData(): void {
    this.adminLoggedIn.set(true);
    this.adminData.set(this.demo.adminData());
  }

  adminApproveMentor(mentorId: number): void {
    this.syncDemoSession(this.demo.approveMentor(mentorId));
  }

  adminRejectMentor(mentorId: number): void {
    this.syncDemoSession(this.demo.rejectMentor(mentorId));
  }

  adminDeleteMentor(mentorId: number): void {
    this.syncDemoSession(this.demo.deleteMentor(mentorId));
  }

  adminDeleteStudent(studentId: number): void {
    this.syncDemoSession(this.demo.deleteStudent(studentId));
  }

  logoutAdmin(): void {
    this.adminLoggedIn.set(false);
    this.adminData.set(null);
    this.notice.set('Admin signed out.');
  }

  // --- Draggable chat window and launcher ---
  private dragging = false;
  private launcherMoved = false;
  private dragOffset = { x: 0, y: 0 };

  startDrag(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    this.dragging = true;
    this.chatDragging = true;
    this.dragOffset = {
      x: event.clientX - this.chatPos.x,
      y: event.clientY - this.chatPos.y
    };

    const onMove = (e: PointerEvent) => {
      if (!this.dragging) {
        return;
      }
      this.chatPos = this.clampPosition(
        { x: e.clientX - this.dragOffset.x, y: e.clientY - this.dragOffset.y },
        this.chatWindowWidth(),
        this.chatWindowHeight()
      );
      this.cdr.detectChanges();
    };

    const onUp = () => {
      this.dragging = false;
      this.chatDragging = false;
      this.cdr.detectChanges();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
    event.preventDefault();
  }

  startLauncherDrag(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    this.launcherDragging = true;
    this.launcherMoved = false;
    const start = { x: event.clientX, y: event.clientY };
    const offset = {
      x: event.clientX - this.chatLauncherPos.x,
      y: event.clientY - this.chatLauncherPos.y
    };

    const onMove = (e: PointerEvent) => {
      const movedX = Math.abs(e.clientX - start.x);
      const movedY = Math.abs(e.clientY - start.y);
      if (movedX > 4 || movedY > 4) {
        this.launcherMoved = true;
      }
      this.chatLauncherPos = this.clampPosition(
        { x: e.clientX - offset.x, y: e.clientY - offset.y },
        this.chatLauncherSize,
        this.chatLauncherSize
      );
      this.cdr.detectChanges();
    };

    const onUp = () => {
      this.launcherDragging = false;
      this.cdr.detectChanges();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      window.setTimeout(() => {
        this.launcherMoved = false;
        this.cdr.detectChanges();
      });
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
    event.preventDefault();
  }

  private chatWindowWidth(): number {
    return Math.min(370, Math.max(280, window.innerWidth - 24));
  }

  private chatWindowHeight(): number {
    return Math.min(460, Math.max(340, window.innerHeight - 24));
  }

  private clampPosition(position: { x: number; y: number }, width: number, height: number): { x: number; y: number } {
    const padding = 12;
    const maxX = Math.max(padding, window.innerWidth - width - padding);
    const maxY = Math.max(padding, window.innerHeight - height - padding);

    return {
      x: Math.max(padding, Math.min(maxX, position.x)),
      y: Math.max(padding, Math.min(maxY, position.y))
    };
  }
}
