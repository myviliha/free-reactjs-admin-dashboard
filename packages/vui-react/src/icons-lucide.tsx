/**
 * The second icon binding: the same slot, against Lucide (`X-1`).
 *
 * **This is what makes the axis real rather than claimed.** A single indirection with one
 * implementation behind it is a refactor; it proves nothing about whether the set can actually be
 * changed. This file is the proof, and `scripts/check-icons.mjs` holds the two side by side and
 * fails if either grows a name the other has not got. **That guarantee is a gate, not a vitest
 * file**: there is no `icons.test.tsx`, and an earlier draft of this paragraph said there was.
 *
 * To ship Lucide instead of Radix, a generated SKU points `icons.tsx` here. Nothing else moves,
 * because no component under `packages/react/src` names an icon set (`scripts/check-icons.mjs`).
 *
 * ## Two differences that are not renames, and are the interesting part
 *
 * **Size.** Radix draws at 15x15; Lucide at 24x24. `theme.css` gives the icon chip to
 * `svg[width="15"], .vui-icon`, so a Lucide icon gets nothing from the first arm of that selector.
 * `sized()` below sets `width`/`height` to 15 and adds `vui-icon`, which is the second arm and
 * exactly what it was written for.
 *
 * **Vocabulary.** Lucide has no caret, so `CaretDown` and `CaretUp` resolve to its chevrons and
 * `CaretSort` to `ChevronsUpDown`. `Reader` is `BookOpen`, `Cube` is `Box`, `Pin` is `MapPin`.
 * These are judgements about meaning and they belong in a binding, which is the argument for
 * semantic names in the slot: `Cross2Icon` would have had nowhere sensible to go.
 */
import {
  AlignLeft as LuAlignLeft,
  ArrowLeft as LuArrowLeft,
  ArrowRight as LuArrowRight,
  ArrowUpRight as LuArrowUpRight,
  Backpack as LuBackpack,
  Bell as LuBell,
  Blend as LuBlend,
  Bookmark as LuBookmark,
  BookOpen as LuBookOpen,
  Box as LuBox,
  Calendar as LuCalendar,
  ChartColumn as LuChartColumn,
  Check as LuCheck,
  ChevronDown as LuChevronDown,
  ChevronLeft as LuChevronLeft,
  ChevronRight as LuChevronRight,
  ChevronsUpDown as LuChevronsUpDown,
  ChevronUp as LuChevronUp,
  Circle as LuCircle,
  CircleCheck as LuCircleCheck,
  CircleQuestionMark as LuCircleQuestionMark,
  CircleUser as LuCircleUser,
  CircleX as LuCircleX,
  Code as LuCode,
  Component as LuComponent,
  Copy as LuCopy,
  type LucideProps,
  Dot as LuDot,
  Download as LuDownload,
  Ellipsis as LuEllipsis,
  Eye as LuEye,
  EyeOff as LuEyeOff,
  File as LuFile,
  FileText as LuFileText,
  Globe as LuGlobe,
  GripVertical as LuGripVertical,
  House as LuHouse,
  IdCard as LuIdCard,
  Info as LuInfo,
  LayoutDashboard as LuLayoutDashboard,
  LayoutTemplate as LuLayoutTemplate,
  LoaderCircle as LuLoaderCircle,
  Lock as LuLock,
  LogIn as LuLogIn,
  Mail as LuMail,
  MapPin as LuMapPin,
  Menu as LuMenu,
  MessageCircle as LuMessageCircle,
  Minus as LuMinus,
  Moon as LuMoon,
  Pencil as LuPencil,
  Play as LuPlay,
  Plus as LuPlus,
  RotateCcw as LuRotateCcw,
  Rows3 as LuRows3,
  Ruler as LuRuler,
  Search as LuSearch,
  Settings as LuSettings,
  Share2 as LuShare2,
  SlidersHorizontal as LuSlidersHorizontal,
  Smartphone as LuSmartphone,
  Sparkles as LuSparkles,
  SquarePen as LuSquarePen,
  Sun as LuSun,
  Table as LuTable,
  Target as LuTarget,
  TextCursorInput as LuTextCursorInput,
  Trash2 as LuTrash2,
  TriangleAlert as LuTriangleAlert,
  Type as LuType,
  Upload as LuUpload,
  User as LuUser,
  X as LuX,
} from "lucide-react";
import type * as React from "react";

/**
 * Draw a Lucide icon at the size the theme expects, and opt it into the chip.
 *
 * `svg[width="15"]` is the Radix arm of the selector in `theme.css` and a Lucide icon never
 * matches it, since Lucide sets its size through a `size` prop that defaults to 24. `.vui-icon` is
 * the arm written for exactly this, so a caller passing its own `className` keeps it.
 */
const sized =
  (Icon: React.ComponentType<LucideProps>) =>
  ({ className, ...props }: LucideProps) => (
    <Icon size={15} className={className ? `vui-icon ${className}` : "vui-icon"} {...props} />
  );

export const AlignLeft = sized(LuAlignLeft);
export const ArrowLeft = sized(LuArrowLeft);
export const ArrowRight = sized(LuArrowRight);
export const ArrowUpRight = sized(LuArrowUpRight);
export const Avatar = sized(LuCircleUser);
export const Backpack = sized(LuBackpack);
export const BarChart = sized(LuChartColumn);
export const Bell = sized(LuBell);
export const Bookmark = sized(LuBookmark);
export const Calendar = sized(LuCalendar);
export const CaretDown = sized(LuChevronDown);
export const CaretSort = sized(LuChevronsUpDown);
export const CaretUp = sized(LuChevronUp);
export const ChatBubble = sized(LuMessageCircle);
export const Check = sized(LuCheck);
export const CheckCircle = sized(LuCircleCheck);
export const ChevronDown = sized(LuChevronDown);
export const ChevronLeft = sized(LuChevronLeft);
export const ChevronRight = sized(LuChevronRight);
export const Circle = sized(LuCircle);
export const Close = sized(LuX);
export const Menu = sized(LuMenu);
export const CloseCircle = sized(LuCircleX);
export const Code = sized(LuCode);
export const Compose = sized(LuSquarePen);
export const Copy = sized(LuCopy);
export const Cube = sized(LuBox);
export const Dashboard = sized(LuLayoutDashboard);
export const Dot = sized(LuDot);
export const Download = sized(LuDownload);
export const DragHandle = sized(LuGripVertical);
export const Edit = sized(LuPencil);
export const Enter = sized(LuLogIn);
export const Eye = sized(LuEye);
export const EyeOff = sized(LuEyeOff);
export const Box = sized(LuBox);
export const File = sized(LuFile);
export const FileText = sized(LuFileText);
export const Input = sized(LuTextCursorInput);
export const Layout = sized(LuLayoutTemplate);
export const Globe = sized(LuGlobe);
export const Help = sized(LuCircleQuestionMark);
export const Home = sized(LuHouse);
export const IdCard = sized(LuIdCard);
export const Info = sized(LuInfo);
export const Lock = sized(LuLock);
export const Mail = sized(LuMail);
export const Minus = sized(LuMinus);
export const Mix = sized(LuBlend);
export const Mobile = sized(LuSmartphone);
export const Moon = sized(LuMoon);
export const MoreHorizontal = sized(LuEllipsis);
export const Person = sized(LuUser);
export const Pin = sized(LuMapPin);
export const Play = sized(LuPlay);
export const Plus = sized(LuPlus);
export const Reader = sized(LuBookOpen);
export const Reset = sized(LuRotateCcw);
export const Rows = sized(LuRows3);
export const Ruler = sized(LuRuler);
export const Search = sized(LuSearch);
export const Settings = sized(LuSettings);
export const Share = sized(LuShare2);
export const Sliders = sized(LuSlidersHorizontal);
export const Spinner = sized(LuLoaderCircle);
export const Sun = sized(LuSun);
export const Table = sized(LuTable);
/** Lucide has no wand; `Sparkles` is its word for the same idea. */
export const Wand = sized(LuSparkles);
export const Target = sized(LuTarget);
export const Text = sized(LuType);
export const Tokens = sized(LuComponent);
export const Trash = sized(LuTrash2);
export const Upload = sized(LuUpload);
export const Warning = sized(LuTriangleAlert);
