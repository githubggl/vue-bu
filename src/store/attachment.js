import store from './store'
import { getFileType, fileType } from '@/utils/cmp'
import downloadUrl from './downloadUrl'
import {downloadApi} from '@/common/constants'

export function contentItemToFileItem({ item, icon, i }){
  let type = item.type
  if (!type) {
      if (item.originalFileName) {
          type = getFileType(item.originalFileName)
      } else if (item.content) {
          type = fileType.text
      } else if (Object.prototype.toString.call(item) == '[object String]') {
          type = fileType.text
          item = { content: item }
      }
  }
  if (type == fileType.text) {
      return {
          type,
          name: 'f_t_' + i,
          url: '/static/images/wj.png',
          meta: item.content
      }
  } else if (type == fileType.pic) {
      return {
          type,
          name: item.originalFileName,
          url: getAttaUrl(item),
          meta: item,
      }
  } else if (type == fileType.audio) {
      return {
          type,
          name: 'f_a_' + i,
          url: icon ? '/static/images/yyin.png' : getAttaUrl(item),
          meta: item
      }
  } else if (type == fileType.video) {
      return {
          type,
          name: 'f_v_' + i,
          url: icon ? '/static/images/shiping.png' : getAttaUrl(item),
          meta: item
      }
  } else {
      // 普通文件，点击下载
      return {
          type,
          name: 'f_f_' + i,
          url: '/static/images/fujian.png',
          meta: item
      }
  }
}

export function contentArrToFileList({ content = [], icon }){
  return content.map((item, i) => contentItemToFileItem( { item, icon, i }));
}

export function fileMetaToItem(item){
  return {
      name: item.originalFileName,
      url: getAttaUrl(item),
      meta: item,
  }
}

export function downloadMeta(meta){
  if (!meta) return
  let url = getAttaUrl(meta)
  downloadUrl(url)
}

export function getAttaUrl(meta){
  if(!meta)return '';
  const name = encodeURIComponent(meta.originalFileName)
  return `${downloadApi}?saveDirName=${meta.saveDirName}&saveFileName=${meta.saveFileName}&_validate_code=${store.getters.validateCode}&originalFileName=${name}`
}
