import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {theme} from "../constants/theme";
import { actions, RichToolbar } from "react-native-pell-rich-editor";
import {RichEditor} from "react-native-pell-rich-editor";



const RichTextEditor = ({ editorRef, onChange }) => {
  return (
    <View style={{ minHeight: 285 }}>
      <RichToolbar
        actions={[
          actions.setStrikethrough,
          actions.removeFormat,
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignRight,
          actions.alignCenter,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading4,
        ]}

        iconMap={{
          [actions.heading1]:({tinColor})=><Text style={{color:tinColor}}>H1</Text>,
          [actions.heading4]:({tinColor})=><Text style={{color:tinColor}}>H4</Text>
        }}


        style={styles.richBar}
        flatContainerStyle={styles.listStyle}
        selectIconTint={theme.colors.primaryDark}
        editor={editorRef}
        disabled={false}
      />
      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={styles.containerStyle}
        placeholder={"Start typing here..."}
        onChange={onChange}

      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  richBar:{
    borderTopRightRadius: theme.radius.xxl,
    borderTopLeftRadius: theme.radius.xxl,
    backgroundColor: theme.colors.gray,
  },
  rich:{
    minHeight:240,
    flex:1,
    borderWidth:1.5,
    borderTopColorWidth:0,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderColor: theme.colors.gray,
    padding:5,

  },
  contentStyle:{
    color:theme.colors.textDark,
    placeholderColor:'gray',
  },
  flatStyle:{
    paddingHorizontal:8,
    gap:3,
  }
});
