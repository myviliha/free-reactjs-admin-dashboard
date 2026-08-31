/**
 * The icon slot: the one place this package names an icon set (`X-1`).
 *
 * **Why this file exists.** The product is sold on breadth of configuration, and until now every
 * axis had exactly one implementation. Icons were the cheapest to open and the one a buyer notices
 * first: sixteen files under `packages/react/src` imported `@radix-ui/react-icons` directly, so
 * "use Lucide instead" meant editing sixteen files and knowing which of Radix's forty-one names
 * mapped to which of Lucide's.
 *
 * Now it means editing this one. `scripts/check-icons.mjs` keeps it that way.
 *
 * ## The names are semantic, not Radix's
 *
 * `Close` rather than `Cross2Icon`, `Warning` rather than `ExclamationTriangleIcon`, `Spinner`
 * rather than `UpdateIcon`. A set-shaped API would have made this file a rename of Radix and the
 * next binding a translation of a translation. What a component asks for is the *meaning*, and
 * each set answers it in its own vocabulary. `icons-lucide.tsx` is the same list against Lucide,
 * and exists so the swap is demonstrated rather than merely claimed.
 *
 * ## Sizing is part of the contract, and it is not free
 *
 * Every Radix icon is 15x15, and `theme.css` gives the icon chip to `svg[width="15"], .vui-icon`.
 * Lucide draws at 24x24 with strokes rather than filled paths, so a binding to it is not a pure
 * rename: it has to opt into `.vui-icon` and set its own size. That is the documented escape hatch
 * and the reason the selector was written with two arms in the first place.
 */
export {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  ArrowTopRightIcon as ArrowUpRight,
  AvatarIcon as Avatar,
  BackpackIcon as Backpack,
  BarChartIcon as BarChart,
  BellIcon as Bell,
  BookmarkIcon as Bookmark,
  BoxIcon as Box,
  CalendarIcon as Calendar,
  CaretDownIcon as CaretDown,
  CaretSortIcon as CaretSort,
  CaretUpIcon as CaretUp,
  ChatBubbleIcon as ChatBubble,
  CheckCircledIcon as CheckCircle,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  CircleIcon as Circle,
  CodeIcon as Code,
  CopyIcon as Copy,
  Cross2Icon as Close,
  CrossCircledIcon as CloseCircle,
  CubeIcon as Cube,
  DashboardIcon as Dashboard,
  DotFilledIcon as Dot,
  DotsHorizontalIcon as MoreHorizontal,
  DownloadIcon as Download,
  DragHandleDots2Icon as DragHandle,
  EnterIcon as Enter,
  EnvelopeClosedIcon as Mail,
  ExclamationTriangleIcon as Warning,
  EyeNoneIcon as EyeOff,
  EyeOpenIcon as Eye,
  FileIcon as File,
  FileTextIcon as FileText,
  GearIcon as Settings,
  GlobeIcon as Globe,
  HamburgerMenuIcon as Menu,
  HomeIcon as Home,
  IdCardIcon as IdCard,
  InfoCircledIcon as Info,
  InputIcon as Input,
  LayoutIcon as Layout,
  LockClosedIcon as Lock,
  MagicWandIcon as Wand,
  MagnifyingGlassIcon as Search,
  MinusIcon as Minus,
  MixerHorizontalIcon as Sliders,
  MixIcon as Mix,
  MobileIcon as Mobile,
  MoonIcon as Moon,
  Pencil1Icon as Edit,
  Pencil2Icon as Compose,
  PersonIcon as Person,
  PlayIcon as Play,
  PlusIcon as Plus,
  QuestionMarkCircledIcon as Help,
  ReaderIcon as Reader,
  ResetIcon as Reset,
  RowsIcon as Rows,
  RulerHorizontalIcon as Ruler,
  SewingPinFilledIcon as Pin,
  Share2Icon as Share,
  SunIcon as Sun,
  TableIcon as Table,
  TargetIcon as Target,
  TextAlignLeftIcon as AlignLeft,
  TextIcon as Text,
  TokensIcon as Tokens,
  TrashIcon as Trash,
  UpdateIcon as Spinner,
  UploadIcon as Upload,
} from "@radix-ui/react-icons";
