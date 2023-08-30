import { Component } from 'solid-js'
import { VsJson } from 'solid-icons/vs'
import { ImFinder } from 'solid-icons/im'
import {
  Si1password,
  SiAdobe,
  SiAdobeacrobatreader,
  SiAdobeaudition,
  SiAdobedreamweaver,
  SiAdobefonts,
  SiAdobeillustrator,
  SiAdobeindesign,
  SiAdobelightroom,
  SiAdobephotoshop,
  SiAdobepremierepro,
  SiAdobexd,
  SiAffinitydesigner,
  SiAffinityphoto,
  SiAffinitypublisher,
  SiAndroid,
  SiAnydesk,
  SiApache,
  SiApacheopenoffice,
  SiApplemusic,
  SiAutodesk,
  SiC,
  SiCplusplus,
  SiCsharp,
  SiCss3,
  SiDotnet,
  SiFiles,
  SiFirefox,
  SiGimp,
  SiGit,
  SiGnubash,
  SiGo,
  SiGodotengine,
  SiGooglephotos,
  SiHtml5,
  SiIos,
  SiJavascript,
  SiJson,
  SiKicad,
  SiMarkdown,
  SiMicrosoftaccess,
  SiMicrosoftexcel,
  SiMicrosoftoutlook,
  SiMicrosoftpowerpoint,
  SiMicrosoftword,
  SiPhp,
  SiPowershell,
  SiPrettier,
  SiPython,
  SiQt,
  SiRuby,
  SiRust,
  SiTensorflow,
  SiTypescript,
  SiVisualstudiocode,
  SiVlcmediaplayer,
  SiWebassembly,
  SiWindows,
  SiXaml,
} from 'solid-icons/si'
import { FaRegularFile, FaSolidCode, FaSolidFile, FaSolidFolder } from 'solid-icons/fa'

const getIcon = (ext: string, iconSize: string) => {
  switch (ext.toLowerCase()) {
    case 'exe':
    case 'dll':
      return <SiWindows size={iconSize} fill="#0078D6" />
    case 'bat':
    case 'ps':
      return <SiPowershell size={iconSize} fill="#5391FE" />

    case 'pst':
      return <SiMicrosoftoutlook size={iconSize} fill="#0078D4" />
    case 'db':
    case 'sqlite':
    case 'accdb':
      return <SiMicrosoftaccess size={iconSize} fill="#A4373A" />

    case 'htm':
    case 'html':
    case 'xhtml':
      return <SiHtml5 size={iconSize} fill="#E34F26" />

    case 'css':
      return <SiCss3 size={iconSize} fill="#1572B6" />

    case 'wat':
    case 'wasm':
      return <SiWebassembly size={iconSize} fill="#654FF0" />

    case 'xsp':
    case 'htc':
    case 'hta':
      return <SiFirefox size={iconSize} fill="#FF7139" />

    case 'vscode':
      return <SiVisualstudiocode size={iconSize} fill="#007ACC" />

    case 'doc':
    case 'docx':
    case 'rtf':
    case 'txt':
      return <SiMicrosoftword size={iconSize} fill="#2B579A" />
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <SiMicrosoftexcel size={iconSize} fill="#217346" />
    case 'pptx':
    case 'ppt':
      return <SiMicrosoftpowerpoint size={iconSize} fill="#B7472A" />

    case 'mov':
    case 'mp4':
    case 'm4v':
    case '3gp':
    case '3g2':
    case 'avi':
    case 'wmv':
    case 'mpg':
    case 'mpeg':
    case 'asf':
    case 'ram':
      return <SiVlcmediaplayer size={iconSize} fill="#FF8800" />

    case 'mp3':
    case 'wav':
    case 'aif':
    case 'aiff':
    case 'mpa':
    case 'm4a':
    case 'wma':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'oga':
    case 'mid':
    case 'midi':
      return <SiApplemusic size={iconSize} fill="#FA243C" />

    case '1pif':
      return <Si1password size={iconSize} fill="#0094F5" />

    case 'bmp':
    case 'jpeg':
    case 'jpg':
    case 'gif':
    case 'tiff':
    case 'tif':
    case 'png':
    case 'pcx':
    case 'rle':
    case 'dib':
    case 'webp':
      return <SiGooglephotos size={iconSize} fill="#4285F4" />

    case 'ps':
    case 'eps':
    case 'prn':
    case 'edm':
    case 'edml':
      return <SiAdobe size={iconSize} fill="#FF61F6" />
    case 'sesx':
      return <SiAdobeaudition size={iconSize} fill="#9999FF" />
    case 'psd':
    case 'psb':
    case 'cmyk':
      return <SiAdobephotoshop size={iconSize} fill="#31A8FF" />
    case 'indd':
    case 'idml':
      return <SiAdobeindesign size={iconSize} fill="#FF3366" />
    case 'ai':
      return <SiAdobeillustrator size={iconSize} fill="#FF9A00" />
    case 'xd':
      return <SiAdobexd size={iconSize} fill="#FF61F6" />
    case 'ttf':
    case 'otf':
      return <SiAdobefonts size={iconSize} fill="#000B1D" />
    case 'pdf':
      return <SiAdobeacrobatreader size={iconSize} fill="#EC1C24" />
    case 'dws':
    case 'dwt':
      return <SiAdobedreamweaver size={iconSize} fill="#FF61F6" />
    case 'lrcat':
    case 'pss':
      return <SiAdobelightroom size={iconSize} fill="#31A8FF" />
    case 'prproj':
      return <SiAdobepremierepro size={iconSize} fill="#9999FF" />

    case 'afphoto':
      return <SiAffinityphoto size={iconSize} fill="#7E4DD2" />
    case 'afdesign':
      return <SiAffinitydesigner size={iconSize} fill="#1B72BE" />
    case 'afpub':
      return <SiAffinitypublisher size={iconSize} fill="#C9284D" />

    case 'dwg':
    case 'dwt':
    case 'dxf':
    case 'dwf':
    case 'dst':
    case 'ipt':
    case 'iam':
    case 'u3d':
    case 'prc':
      return <SiAutodesk size={iconSize} fill="#000000" />

    case 'apk':
    case 'xapk':
    case 'aab':
    case 'bundle':
      return <SiAndroid size={iconSize} fill="#3DDC84" />

    case 'ipa':
      return <SiIos size={iconSize} fill="#000000" />

    case 'json':
      return <VsJson size={iconSize} fill="#f39c12" />
    case 'xml':
      return <FaSolidCode size={iconSize} />

    case 'js':
    case 'jsx':
    case 'es6':
      return <SiJavascript size={iconSize} fill="#F7DF1E" />
    case 'ts':
    case 'tsx':
      return <SiTypescript size={iconSize} fill="#3178C6" />
    case 'yml':
    case 'yaml':
    case 'md':
      return <SiMarkdown size={iconSize} fill="#000000" />
    case 'anydesk':
      return <SiAnydesk size={iconSize} fill="#EF443B" />
    case 'htaccess':
      return <SiApache size={iconSize} fill="#D22128" />

    case 'odt':
    case 'odp':
    case 'ods':
    case 'odg':
    case 'odf':
    case 'sxw':
    case 'sxi':
    case 'sxc':
    case 'sxd':
    case 'stw':
      return <SiApacheopenoffice size={iconSize} fill="#0E85CD" />

    case 'sh':
    case 'bashrc':
      return <SiGnubash size={iconSize} fill="#4EAA25" />
    case 'go':
    case 'templ':
    case 'mod':
    case 'sum':
      return <SiGo size={iconSize} fill="#00ADD8" />
    case 'tf':
      return <SiTensorflow size={iconSize} fill="#FF6F00" />
    case 'rb':
      return <SiRuby size={iconSize} fill="#CC342D" />
    case 'rs':
      return <SiRust size={iconSize} fill="#000000" />
    case 'qt':
      return <SiQt size={iconSize} fill="#41CD52" />
    case 'py':
      return <SiPython size={iconSize} fill="#3776AB" />
    case 'php':
      return <SiPhp size={iconSize} fill="#777BB4" />
    case 'kicad':
      return <SiKicad size={iconSize} fill="#314CB0" />
    case 'godot':
      return <SiGodotengine size={iconSize} fill="#478CBF" />
    case 'git':
    case 'gitignore':
      return <SiGit size={iconSize} fill="#F05032" />
    case 'gimp':
      return <SiGimp size={iconSize} fill="#5C5543" />
    case 'prettierrc':
      return <SiPrettier size={iconSize} fill="#F7B93E" />

    case 'asmx':
    case 'asp':
    case 'atp':
    case 'bsc':
    case 'dbp':
    case 'disco':
    case 'hxc':
    case 'idb':
    case 'obj':
    case 'sln':
    case 'suo':
    case 'vap':
    case 'vbg':
    case 'vb':
    case 'vbp':
    case 'vip':
    case 'vbproj':
    case 'vdproj':
    case 'vmx':
    case 'vup':
      return <SiDotnet size={iconSize} fill="#FD5F07" />
    case 'c':
    case 'h':
      return <SiC />
    case 'cpp':
    case 'vcxproj':
    case 'vcxitems':
      return <SiCplusplus size={iconSize} fill="#00599C" />
    case 'cs':
    case 'csproj':
      return <SiCsharp size={iconSize} fill="#239120" />
    case 'xaml':
      return <SiXaml size={iconSize} fill="#0C54C2" />

    case 'ds_store':
      return <ImFinder size={iconSize} fill="#3498db" />

    default:
      return null
  }
}

const FileExtensionIcon: Component<{
  directory: boolean
  ext: string
  iconSize?: string
  fileSize?: string
}> = ({ directory, ext, iconSize, fileSize }) => {
  if (!iconSize) iconSize = '1.3em'
  if (!fileSize) fileSize = '3em'

  if (directory) return <FaSolidFolder size={fileSize} fill="#f7cd00" class="ml-auto" />

  if (ext.startsWith('.')) ext = ext.slice(1)
  const icon = iconSize === '0' ? null : getIcon(ext, iconSize)
  const fileIcon = <FaRegularFile size={fileSize} fill="#636e72" class="ml-auto" />

  if (icon === null) return fileIcon
  return (
    <div class="items-center justify-center flex">
      {fileIcon}
      <div class="absolute">{icon}</div>
    </div>
  )
}

export default FileExtensionIcon
